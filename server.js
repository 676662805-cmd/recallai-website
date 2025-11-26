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
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

let supabase;
if (SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('Initialized Supabase client');
} else {
  console.warn('SUPABASE_URL or SUPABASE_KEY not found. Data will not be persisted!');
}

app.use(cors());
app.use(bodyParser.json());

// In-memory store for verification codes (for demo purposes)
// In production, use Redis or a database
const verificationCodes = {};

// Endpoint to send verification code
app.post('/api/send-code', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Check if user already exists in Supabase
  if (supabase) {
    const { data: existingUser, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return res.status(400).json({ error: 'This email is already registered.' });
    }
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store code
  verificationCodes[email] = code;
  
  console.log(`[LOG] Generated code for ${email}: ${code}`);

  try {
    const data = await resend.emails.send({
      from: 'RecallAI <team@recalls-ai.com>', // 已更新为您自己的域名邮箱
      to: email,
      subject: 'RecallAI Verification Code',
      html: `<div style="font-family: sans-serif; padding: 20px;">
              <h2>RecallAI Waitlist Verification</h2>
              <p>Your verification code is:</p>
              <h1 style="color: #0033cc; letter-spacing: 5px;">${code}</h1>
              <p>This code will expire in 10 minutes.</p>
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

  if (verificationCodes[email] === code) {
    // Code is valid
    try {
      if (supabase) {
        // Save to Supabase
        const { error } = await supabase
          .from('users')
          .insert([{ email }]);
        
        if (error) {
          // Handle duplicate key error specifically if needed, though we checked before sending code
          if (error.code === '23505') { // Postgres unique violation code
             return res.status(400).json({ error: 'This email is already registered.' });
          }
          throw error;
        }
      } else {
        console.warn('Supabase not connected. User not saved to DB.');
      }
      
      delete verificationCodes[email]; // Invalidate code after use
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
      .from('users')
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
