import React, { useState, useEffect } from 'react';

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users?secret=${secret}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setAuthenticated(true);
      } else {
        alert('Invalid secret key');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!authenticated) {
    return (
      <div style={{ padding: '40px', color: 'white', textAlign: 'center' }}>
        <h2>Admin Login</h2>
        <input 
          type="password" 
          value={secret} 
          onChange={e => setSecret(e.target.value)} 
          placeholder="Enter Admin Secret"
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #333', background: '#111', color: 'white', marginRight: '10px' }}
        />
        <button onClick={fetchUsers} style={{ padding: '10px 20px', borderRadius: '5px', background: 'var(--link-color)', border: 'none', cursor: 'pointer' }}>
          Login
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', color: 'white', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Registered Users ({users.length})</h2>
      <button onClick={() => setAuthenticated(false)} style={{ marginBottom: '20px', padding: '5px 10px', background: '#333', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #333' }}>
              <th style={{ padding: '10px' }}>Email</th>
              <th style={{ padding: '10px' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: '10px' }}>{user.email}</td>
                <td style={{ padding: '10px' }}>{new Date(user.created_at || user.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
      const response = await fetch('/api/send-code', {
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
      const response = await fetch('/api/verify-code', {
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
      <div style={{ padding: '40px', background: '#000', border: '1px solid #333', borderRadius: '20px', boxShadow: '0 4px 20px var(--shadow-color)', maxWidth: '500px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '24px', color: 'var(--link-color)', marginBottom: '10px' }}>You're on the list!</h3>
        <p style={{ color: 'var(--text-secondary)' }}>Thanks for joining. You could use our App free right now!!!</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', background: '#000', border: '1px solid #333', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', maxWidth: '500px', margin: '0 auto' }}>
      <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>Pre-order Now</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
        You could use our App <span style={{ color: 'var(--link-color)', fontWeight: 'bold' }}>Free Right Now!!!</span>
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
              background: '#111',
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
                background: '#111',
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
            color: 'black', 
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

function InteractiveDemo() {
  const popoverRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const dragOffset = React.useRef({ x: 0, y: 0 });

  const handleMouseMove = React.useCallback((e) => {
    if (e.cancelable) e.preventDefault();

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    const popover = popoverRef.current;
    const container = containerRef.current;
    if (!popover || !container) return;
    
    let newLeft = clientX - dragOffset.current.x;
    let newTop = clientY - dragOffset.current.y;
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const popoverWidth = popover.offsetWidth;
    const popoverHeight = popover.offsetHeight;
    
    if (newLeft < 0) newLeft = 0;
    if (newLeft > containerWidth - popoverWidth) newLeft = containerWidth - popoverWidth;
    if (newTop < 0) newTop = 0;
    if (newTop > containerHeight - popoverHeight) newTop = containerHeight - popoverHeight;
    
    popover.style.left = `${newLeft}px`;
    popover.style.top = `${newTop}px`;
  }, []);

  const handleMouseUp = React.useCallback(() => {
    if (popoverRef.current) {
        popoverRef.current.classList.remove('dragging');
    }
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('touchmove', handleMouseMove);
    document.removeEventListener('touchend', handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = React.useCallback((e) => {
    if (e.cancelable && !e.type.startsWith('touch')) e.preventDefault(); 
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    const popover = popoverRef.current;
    if (!popover) return;

    dragOffset.current = {
      x: clientX - popover.offsetLeft,
      y: clientY - popover.offsetTop
    };
    
    popover.classList.add('dragging');
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleMouseMove, { passive: false });
    document.addEventListener('touchend', handleMouseUp);
  }, [handleMouseMove, handleMouseUp]);

  React.useEffect(() => {
    const setInitialPosition = () => {
        const popover = popoverRef.current;
        const container = containerRef.current;
        if (!popover || !container) return;

        if (popover.offsetWidth === 0) {
            setTimeout(setInitialPosition, 50);
            return;
        }
        const initialLeft = (container.clientWidth - popover.offsetWidth) / 2;
        const initialTop = (container.clientHeight - popover.offsetHeight) / 2;
        popover.style.left = `${initialLeft}px`;
        popover.style.top = `${initialTop}px`;
    };

    setInitialPosition();
    window.addEventListener('resize', setInitialPosition);
    return () => window.removeEventListener('resize', setInitialPosition);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto relative mt-10 mb-10 group" ref={containerRef}>
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Hover to View Details & Drag</h1>
        <p className="text-center text-gray-400 mb-8">Hover over the laptop image to see the overlay, then drag it around.</p>
        
        <div className="image-container mx-auto relative z-0">
            <img 
                src="/laptop.png" 
                alt="Main: Laptop Video Conference" 
                className="rounded-lg shadow-xl cursor-pointer"
            />
        </div>

        <div 
            ref={popoverRef}
            className="popover-image w-2/3 md:w-1/3 opacity-0 invisible group-hover:opacity-100 group-hover:visible z-10"
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
        >
            <img 
                src="/resume.png"
                alt="Popover: Resume Details" 
                className="rounded-md w-full h-auto shadow-2xl"
            />
        </div>
    </div>
  );
}

function App() {
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    // Check URL for admin flag
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setShowAdmin(true);
    }
  }, []);

  if (showAdmin) {
    return <AdminPanel />;
  }

  return (
    <div style={{ fontFamily: 'sans-serif', color: 'var(--text-color)', lineHeight: '1.6' }}>
      {/* Navigation */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 40px', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>RecallAI</h1>
        <div>
          <a href="#features" style={{ margin: '0 15px', textDecoration: 'none', color: 'var(--text-secondary)' }}>Features</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--header-bg)', transition: 'background-color 0.3s' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>Instant Recall, Confident Interviewing</h1>
        <p style={{ fontSize: '20px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px' }}>
          Knowledge Cards + Real-time voice transcription + AI smart prompts + Invisible overlay window<br/>Eliminate the fear of forgetting; ensure every answer is precise and complete
        </p>
        
        <div style={{ marginBottom: '40px' }}>
          <button 
            onClick={() => setShowWaitlist(true)}
            style={{ 
              padding: '15px 40px', 
              background: 'var(--link-color)', 
              color: 'black', 
              border: 'none', 
              borderRadius: '30px', 
              fontSize: '18px', 
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px var(--shadow-color)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Pre-order Now
          </button>
          <p style={{ marginTop: '10px', fontSize: '14px', color: 'var(--text-tertiary)' }}>
            Limited-Time Free Trial - Register to Activate Now!
          </p>
        </div>

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

      {/* Interactive Demo Section */}
      <InteractiveDemo />

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
