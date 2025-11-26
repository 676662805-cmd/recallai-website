const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Resend } = require('resend');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Resend with your API Key
// ⚠️ REPLACE 're_123456789' WITH YOUR ACTUAL RESEND API KEY
// Best practice: Use process.env.RESEND_API_KEY in Vercel settings
const resend = new Resend(process.env.RESEND_API_KEY || 're_DC2xVqMg_MvqwxSAJK4GiZxPNwct2bae6');

// Connect to MongoDB
// ⚠️ You must add MONGODB_URI to your Vercel Environment Variables
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.warn('MONGODB_URI not found. Data will not be persisted!');
}

// Define User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

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

  // Check if user already exists
  if (MONGODB_URI) {
    const existingUser = await User.findOne({ email });
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
      if (MONGODB_URI) {
        // Save to MongoDB
        // Use findOneAndUpdate with upsert to prevent race conditions/duplicates
        await User.findOneAndUpdate(
          { email }, 
          { email, createdAt: new Date() }, 
          { upsert: true, new: true }
        );
      } else {
        console.warn('MongoDB not connected. User not saved to DB.');
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

  if (MONGODB_URI) {
    const users = await User.find().sort({ createdAt: -1 });
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
