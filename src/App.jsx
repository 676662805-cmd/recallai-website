import React from 'react';

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', color: '#333', lineHeight: '1.6' }}>
      {/* Navigation */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 40px', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>RecallAI</h1>
        <div>
          <a href="#features" style={{ margin: '0 15px', textDecoration: 'none', color: '#666' }}>Features</a>
          <a href="#download" style={{ margin: '0 15px', textDecoration: 'none', color: '#007AFF', fontWeight: 'bold' }}>Download</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ textAlign: 'center', padding: '80px 20px', background: '#f5f5f7' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>Your Invisible Interview Assistant</h1>
        <p style={{ fontSize: '20px', color: '#666', maxWidth: '600px', margin: '0 auto 40px' }}>
          Real-time voice transcription + AI smart prompts + Invisible overlay window.<br/>Make interviewers think you're improvising, when you're actually reading.
        </p>
        <a 
          href="https://github.com/676662805-cmd/RecallAI/releases"
          target="_blank"
          style={{ 
            padding: '15px 40px', 
            fontSize: '18px', 
            background: '#007AFF', 
            color: 'white', 
            borderRadius: '30px', 
            textDecoration: 'none',
            boxShadow: '0 4px 12px rgba(0,122,255,0.3)'
          }}
        >
          Free Download for Windows
        </a>
        <p style={{ marginTop: '15px', fontSize: '14px', color: '#888' }}>v0.9 Beta • Groq Key Required</p>
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
      <footer style={{ textAlign: 'center', padding: '40px', borderTop: '1px solid #eee', marginTop: '40px' }}>
        <p>&copy; 2024 RecallAI. All rights reserved.</p>
        <p style={{ fontSize: '12px', color: '#999' }}>For educational purposes only. Please comply with local laws and regulations.</p>
      </footer>
    </div>
  );
}

export default App;
