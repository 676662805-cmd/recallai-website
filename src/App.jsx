import React from 'react';

function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', color: '#333', lineHeight: '1.6' }}>
      {/* 导航栏 */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 40px', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>RecallAI</h1>
        <div>
          <a href="#features" style={{ margin: '0 15px', textDecoration: 'none', color: '#666' }}>功能</a>
          <a href="#download" style={{ margin: '0 15px', textDecoration: 'none', color: '#007AFF', fontWeight: 'bold' }}>下载</a>
        </div>
      </nav>

      {/* Hero 区域 */}
      <header style={{ textAlign: 'center', padding: '80px 20px', background: '#f5f5f7' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>你的隐形面试外挂</h1>
        <p style={{ fontSize: '20px', color: '#666', maxWidth: '600px', margin: '0 auto 40px' }}>
          实时语音转写 + AI 智能提词 + 幽灵隐形窗口。<br/>让面试官以为你在即兴发挥，其实你在照着念。
        </p>
        <a 
          href="https://github.com/你的GitHub用户名/RecallAI/releases"
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
          免费下载 Windows 版
        </a>
        <p style={{ marginTop: '15px', fontSize: '14px', color: '#888' }}>v0.9 Beta • 需自备 Groq Key</p>
      </header>

      {/* 功能介绍 */}
      <section id="features" style={{ padding: '60px 20px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
          <div>
            <h3>👻 幽灵窗口</h3>
            <p>全透明悬浮窗，鼠标穿透。你可以直接操作 Zoom/Teams，完全不影响面试流程。</p>
          </div>
          <div>
            <h3>⚡️ 极速转写</h3>
            <p>集成 Groq Turbo 引擎，0.2秒实时出字。甚至比面试官说话还快。</p>
          </div>
          <div>
            <h3>🧠 AI 智能兜底</h3>
            <p>哪怕没准备到的问题，AI 也能根据上下文实时生成高情商回答。</p>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer style={{ textAlign: 'center', padding: '40px', borderTop: '1px solid #eee', marginTop: '40px' }}>
        <p>&copy; 2024 RecallAI. All rights reserved.</p>
        <p style={{ fontSize: '12px', color: '#999' }}>仅供学习交流使用，请遵守当地法律法规。</p>
      </footer>
    </div>
  );
}

export default App;
