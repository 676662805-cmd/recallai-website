const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Resend with your API Key
// ⚠️ REPLACE 're_123456789' WITH YOUR ACTUAL RESEND API KEY
// Best practice: Use process.env.RESEND_API_KEY in Vercel settings
const resend = new Resend(process.env.RESEND_API_KEY || 're_DC2xVqMg_MvqwxSAJK4GiZxPNwct2bae6');

// Initialize Supabase
// ⚠️ You must add SUPABASE_URL and SUPABASE_KEY to your Vercel Environment Variables
// IMPORTANT: To bypass RLS (Row Level Security) for the Admin Panel and User Checks, 
// use the "service_role" key for SUPABASE_KEY, NOT the "anon" key.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Enhanced debugging
console.log('=== Environment Variables Check ===');
console.log('SUPABASE_URL:', SUPABASE_URL ? SUPABASE_URL.substring(0, 30) + '...' : 'NOT SET');
console.log('SUPABASE_KEY:', SUPABASE_KEY ? 'SET (length: ' + SUPABASE_KEY.length + ')' : 'NOT SET');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'SET' : 'NOT SET');
console.log('Available env keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('RESEND')).join(', '));
console.log('=================================');

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('✓ Supabase client initialized successfully');
  } catch (err) {
    console.error('✗ Failed to initialize Supabase client:', err.message);
    supabase = null;
  }
} else {
  console.error('✗ SUPABASE_URL or SUPABASE_KEY not found!');
  console.error('  SUPABASE_URL present:', !!SUPABASE_URL);
  console.error('  SUPABASE_KEY present:', !!SUPABASE_KEY);
}

app.use(cors());
app.use(bodyParser.json());

// In-memory store for verification codes (for demo purposes)
// In production, use Redis or a database
// const verificationCodes = {}; // REMOVED: In-memory store doesn't work on Vercel Serverless

// Endpoint to send verification code
app.post('/api/send-code', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Warn if Supabase is not connected (but continue to send email)
  if (!supabase) {
    console.warn('⚠️  /api/send-code - Supabase not connected! Code will not be verifiable.');
    console.warn('   Please set SUPABASE_URL and SUPABASE_KEY in Vercel Environment Variables');
  }

  // Check if user already exists in Supabase
  if (supabase) {
    const { data: existingUser, error } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return res.status(400).json({ error: 'This email is already registered.' });
    }
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store code in Supabase (Persistent storage)
  if (supabase) {
    const { error } = await supabase
      .from('verification_codes')
      .upsert({ 
        email, 
        code,
        created_at: new Date().toISOString() 
      }, { onConflict: 'email' });
      
      if (error) {
      console.error("Supabase Error storing code:", error);
      return res.status(500).json({ error: 'Database error storing code' });
    }
    console.log('[LOG] Code stored in Supabase verification_codes table');
  } else {
    console.warn('[WARN] Supabase not available - code will NOT be stored!');
  }
  
  console.log(`[LOG] Generated code for ${email}: ${code}`);  try {
    const data = await resend.emails.send({
      from: 'RecallAI <team@recalls-ai.com>', // 已更新为您自己的域名邮箱
      to: email,
      subject: 'RecallAI Verification Code',
      html: `<div style="font-family: sans-serif; padding: 20px;">
              <h2>RecallAI Waitlist Verification</h2>
              <p>Your verification code is:</p>
              <h1 style="color: #0033cc; letter-spacing: 5px;">${code}</h1>
              <p>This code will expire in 1 minute.</p>
             </div>`
    });

    if (data.error) {
      console.error("Resend API Error:", data.error);
      return res.status(500).json({ error: data.error.message });
    }

    res.json({ message: 'Verification code sent', id: data.id });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

// Endpoint to verify code
app.post('/api/verify-code', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }

  // Check Supabase connection first
  if (!supabase) {
    console.error('❌ /api/verify-code - Supabase not connected!');
    console.error('Debug - SUPABASE_URL:', !!process.env.SUPABASE_URL);
    console.error('Debug - SUPABASE_KEY:', !!process.env.SUPABASE_KEY);
    return res.status(500).json({ 
      error: 'Database not configured',
      hint: 'Please set SUPABASE_URL and SUPABASE_KEY in Vercel Environment Variables'
    });
  }

  console.log(`[LOG] Verifying code for email: ${email}`);
  let isValid = false;

  if (supabase) {
    // Retrieve code from Supabase
    const { data, error } = await supabase
      .from('verification_codes')
      .select('code, created_at')
      .eq('email', email)
      .single();

    if (data) {
      if (data.code !== code) {
        return res.status(400).json({ error: 'Invalid code' });
      }

      // Check expiration (1 minute = 60000 ms)
      const createdAt = new Date(data.created_at).getTime();
      const now = new Date().getTime();
      
      if ((now - createdAt) > 60000) {
        return res.status(400).json({ error: 'Code expired. Please request a new one.' });
      }

      isValid = true;
    } else {
      console.log(`[LOG] No verification code found for email: ${email}`);
      return res.status(400).json({ error: 'Invalid code or code not found' });
    }
  }

  if (isValid) {
    // Code is valid
    try {
      if (supabase) {
        // Save to Supabase Waitlist
        const { error } = await supabase
          .from('waitlist')
          .insert([{ email }]);
        
        if (error) {
          if (error.code === '23505') { // Postgres unique violation code
             return res.status(400).json({ error: 'This email is already registered.' });
          }
          throw error;
        }

        // Delete the used verification code
        await supabase
          .from('verification_codes')
          .delete()
          .eq('email', email);
      }
      
      return res.json({ success: true, message: 'Verified successfully' });
    } catch (error) {
      console.error('Error saving user:', error);
      return res.status(500).json({ error: 'Database error' });
    }
  } else {
    return res.status(400).json({ error: 'Invalid code' });
  }
});

// Admin endpoint to get users
app.get('/api/users', async (req, res) => {
  const { secret } = req.query;
  // Simple protection
  if (secret !== process.env.ADMIN_SECRET && secret !== 'recallai-admin-2024') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (supabase) {
    const { data: users, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json(users);
  } else {
    res.json([]);
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
