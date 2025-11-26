import React, { useState } from 'react';

function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email'); // 'email', 'verify', 'success'
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) return alert('Please enter your email');
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        setStep('verify');
        alert(`Verification code sent to ${email}!\n(Check the server console for the code)`);
      } else {
        alert('Failed to send code. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code) return alert('Please enter the code');
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setStep('success');
      } else {
        alert(data.error || 'Invalid code. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div style={{ padding: '40px', background: 'var(--bg-color)', borderRadius: '20px', boxShadow: '0 4px 20px var(--shadow-color)', maxWidth: '500px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '24px', color: 'var(--link-color)', marginBottom: '10px' }}>🎉 You're on the list!</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Thanks for joining. We've sent a confirmation email with your 20% off coupon code.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', background: 'var(--bg-color)', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', maxWidth: '500px', margin: '0 auto' }}>
      <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>Join the Waitlist</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
        Get notified when we launch and receive an exclusive <span style={{ color: 'var(--link-color)', fontWeight: 'bold' }}>20% discount</span>.
      </p>
      
      <form onSubmit={step === 'email' ? handleSendCode : handleVerify}>
        <div style={{ marginBottom: '20px', textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Email Address</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            disabled={step === 'verify'}
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)',
              background: 'var(--bg-color)',
              color: 'var(--text-color)',
              fontSize: '16px',
              boxSizing: 'border-box'
            }} 
          />
        </div>

        {step === 'verify' && (
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold' }}>Verification Code</label>
            <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)',
                background: 'var(--bg-color)',
                color: 'var(--text-color)',
                fontSize: '16px',
                boxSizing: 'border-box'
              }} 
            />
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '5px' }}>Code sent to {email}</p>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '15px', 
            background: 'var(--link-color)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '30px', 
            fontSize: '16px', 
            fontWeight: 'bold',
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1,
            boxShadow: '0 4px 12px var(--shadow-color)'
          }}
        >
          {loading ? 'Processing...' : (step === 'email' ? 'Get Verification Code' : 'Confirm & Join')}
        </button>
      </form>
    </div>
  );
}

function App() {
  const [showWaitlist, setShowWaitlist] = useState(false);

  return (
    <div style={{ fontFamily: 'sans-serif', color: 'var(--text-color)', lineHeight: '1.6' }}>
      {/* Navigation */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 40px', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>RecallAI</h1>
        <div>
          <a href="#features" style={{ margin: '0 15px', textDecoration: 'none', color: 'var(--text-secondary)' }}>Features</a>
          <button 
            onClick={() => setShowWaitlist(true)}
            style={{ 
              margin: '0 15px', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              fontSize: '16px', 
              fontFamily: 'inherit',
              color: 'var(--text-secondary)' 
            }}
          >
            Waitlist
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--header-bg)', transition: 'background-color 0.3s' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>Your Invisible Interview Assistant</h1>
        <p style={{ fontSize: '20px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px' }}>
          Real-time voice transcription + AI smart prompts + Invisible overlay window.<br/>Make interviewers think you're improvising, when you're actually reading.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', maxWidth: '900px', margin: '0 auto' }}>
          <a 
            href="https://github.com/676662805-cmd/RecallAI/releases"
            target="_blank"
            className="download-btn"
          >
            Download for Mac (Intel)
          </a>
          <a 
            href="https://github.com/676662805-cmd/RecallAI/releases"
            target="_blank"
            className="download-btn"
          >
            Download for Mac (M-Series)
          </a>
          <a 
            href="https://github.com/676662805-cmd/RecallAI/releases"
            target="_blank"
            className="download-btn"
          >
            Download for Windows
          </a>
        </div>
        <p style={{ marginTop: '15px', fontSize: '14px', color: 'var(--text-tertiary)' }}>v0.9 Beta • Groq Key Required</p>
      </header>

      {/* Features Section */}
      <section id="features" style={{ padding: '60px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
          <div>
            <h3>👻 Ghost Window</h3>
            <p>Fully transparent floating window with mouse-through. Operate Zoom/Teams directly without disrupting the interview flow.</p>
          </div>
          <div>
            <h3>⚡️ Lightning-Fast Transcription</h3>
            <p>Powered by Groq Turbo engine, 0.2s real-time output. Even faster than the interviewer speaks.</p>
          </div>
          <div>
            <h3>🧠 AI Smart Backup</h3>
            <p>Even for unprepared questions, AI generates contextual high-EQ answers in real time.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '40px', borderTop: '1px solid var(--border-color)', marginTop: '40px' }}>
        <p>&copy; 2024 RecallAI. All rights reserved.</p>
        <p style={{ fontSize: '12px', color: 'var(--text-quaternary)' }}>For educational purposes only. Please comply with local laws and regulations.</p>
      </footer>

      {/* Waitlist Modal */}
      {showWaitlist && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowWaitlist(false)}
        >
          <div style={{ position: 'relative', width: '90%', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowWaitlist(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              ✕
            </button>
            <WaitlistForm />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
