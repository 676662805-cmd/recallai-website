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
const resend = new Resend('re_DC2xVqMg_MvqwxSAJK4GiZxPNwct2bae6');

app.use(cors({
  origin: ['http://localhost:5173', 'https://recalls-ai.com', 'https://www.recalls-ai.com'],
  credentials: true
}));
app.use(bodyParser.json());

// In-memory store for verification codes (for demo purposes)
// In production, use Redis or a databasee, 'dist')));
const verificationCodes = {};
// In-memory store for verification codes (for demo purposes)
// File path for the waitlistr a database
const WAITLIST_FILE = path.join(__dirname, 'waitlist.json');

// Helper to read waitlistist
const getWaitlist = () => {join(__dirname, 'waitlist.json');
  if (!fs.existsSync(WAITLIST_FILE)) {
    return [];ead waitlist
  }st getWaitlist = () => {
  const data = fs.readFileSync(WAITLIST_FILE);
  return JSON.parse(data);
};}
  const data = fs.readFileSync(WAITLIST_FILE);
// Helper to save to waitlist
const addToWaitlist = (email) => {
  const list = getWaitlist();
  if (!list.includes(email)) {
    list.push(email); (email) => {
    fs.writeFileSync(WAITLIST_FILE, JSON.stringify(list, null, 2));
  }f (!list.includes(email)) {
};  list.push(email);
    fs.writeFileSync(WAITLIST_FILE, JSON.stringify(list, null, 2));
// Configure Nodemailer
// ⚠️ 重要：请替换下面的配置为你自己的邮箱信息
/*
const transporter = nodemailer.createTransport({
    service: 'gmail', // 使用 Gmail
    auth: {
        user: 'your-email@gmail.com', // 替换为你的 Gmail 邮箱
        pass: 'your-app-password' // 替换为你的 Gmail "应用专用密码" (注意：不是你的登录密码！)
    }uth: {
});     user: 'your-email@gmail.com', // 替换为你的 Gmail 邮箱
*/      pass: 'your-app-password' // 替换为你的 Gmail "应用专用密码" (注意：不是你的登录密码！)
    }
// Endpoint to send verification code
app.post('/api/send-code', async (req, res) => {
  const { email } = req.body;
   Endpoint to send verification code
  if (!email) {send-code', async (req, res) => {
    return res.status(400).json({ error: 'Email is required' });
  }
  if (!email) {
  // Generate 6-digit code.json({ error: 'Email is required' });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store code-digit code
  verificationCodes[email] = code; Math.random() * 900000).toString();
  
  console.log(`[LOG] Generated code for ${email}: ${code}`);
  verificationCodes[email] = code;
  try {
    const data = await resend.emails.send({mail}: ${code}`);
      from: 'RecallAI <team@recalls-ai.com>', // 已更新为您自己的域名邮箱
      to: email,
      subject: 'RecallAI Verification Code',
      html: `<div style="font-family: sans-serif; padding: 20px;">
              <h2>RecallAI Waitlist Verification</h2>
              <p>Your verification code is:</p>
              <h1 style="color: #0033cc; letter-spacing: 5px;">${code}</h1>
              <p>This code will expire in 10 minutes.</p>
             </div>`r verification code is:</p>
    });       <h1 style="color: #0033cc; letter-spacing: 5px;">${code}</h1>
              <p>This code will expire in 10 minutes.</p>
    if (data.error) {
      console.error("Resend API Error:", data.error);
      return res.status(500).json({ error: data.error.message });
    }f (data.error) {
      console.error("Resend API Error:", data.error);
    res.json({ message: 'Verification code sent', id: data.id });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: 'Failed to send email.' }); });
  } catch (error) {
}); console.error("Error sending email:", error);
    res.status(500).json({ error: 'Failed to send email.' });
// Endpoint to verify code
app.post('/api/verify-code', (req, res) => {
  const { email, code } = req.body;
// Endpoint to verify code
  if (!email || !code) {de', (req, res) => {
    return res.status(400).json({ error: 'Email and code are required' });
  }
  if (!email || !code) {
  if (verificationCodes[email] === code) {Email and code are required' });
    // Code is valid
    addToWaitlist(email);
    delete verificationCodes[email]; // Invalidate code after use
    return res.json({ success: true, message: 'Verified successfully' });
  } else {aitlist(email);
    return res.status(400).json({ error: 'Invalid code' });er use
  } return res.json({ success: true, message: 'Verified successfully' });
}); else {
    return res.status(400).json({ error: 'Invalid code' });
// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));app.listen(PORT, () => {






});  console.log(`Server running on http://localhost:${PORT}`);app.listen(PORT, () => {});  console.log(`Server running on http://localhost:${PORT}`);
});
