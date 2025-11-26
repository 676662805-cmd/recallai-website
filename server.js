const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Resend } = require('resend');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Resend with your API Key
// ⚠️ REPLACE 're_123456789' WITH YOUR ACTUAL RESEND API KEY
// Best practice: Use process.env.RESEND_API_KEY in Vercel settings
const resend = new Resend(process.env.RESEND_API_KEY || 're_DC2xVqMg_MvqwxSAJK4GiZxPNwct2bae6');

app.use(cors());
app.use(bodyParser.json());

// In-memory store for verification codes (for demo purposes)
// In production, use Redis or a database
const verificationCodes = {};

// File path for the waitlist
// In Vercel (production), we can only write to /tmp, but data is ephemeral.
const isVercel = process.env.VERCEL === '1';
const WAITLIST_FILE = isVercel 
  ? path.join('/tmp', 'waitlist.json') 
  : path.join(__dirname, 'waitlist.json');

// Helper to read waitlist
const getWaitlist = () => {
  if (!fs.existsSync(WAITLIST_FILE)) {
    return [];
  }
  const data = fs.readFileSync(WAITLIST_FILE);
  return JSON.parse(data);
};

// Helper to save to waitlist
const addToWaitlist = (email) => {
  const list = getWaitlist();
  if (!list.includes(email)) {
    list.push(email);
    fs.writeFileSync(WAITLIST_FILE, JSON.stringify(list, null, 2));
  }
};

// Configure Nodemailer
// ⚠️ 重要：请替换下面的配置为你自己的邮箱信息
/*
const transporter = nodemailer.createTransport({
    service: 'gmail', // 使用 Gmail
    auth: {
        user: 'your-email@gmail.com', // 替换为你的 Gmail 邮箱
        pass: 'your-app-password' // 替换为你的 Gmail "应用专用密码" (注意：不是你的登录密码！)
    }
});
*/

// Endpoint to send verification code
app.post('/api/send-code', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
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
app.post('/api/verify-code', (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' });
  }

  if (verificationCodes[email] === code) {
    // Code is valid
    addToWaitlist(email);
    delete verificationCodes[email]; // Invalidate code after use
    return res.json({ success: true, message: 'Verified successfully' });
  } else {
    return res.status(400).json({ error: 'Invalid code' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
