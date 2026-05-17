import React, { useState, useEffect } from 'react';
import CameraFeed from './components/CameraFeed';
import DetectionPanel from './components/DetectionPanel';
import { useSignDetection } from './hooks/useSignDetection';
import { Hand, Settings, Aperture, Video, MessageSquare, Volume2, Trash2, Sun, Moon } from 'lucide-react';

function App() {
  const { detectSign, isDetecting, result, error } = useSignDetection();
  const [autoCapture, setAutoCapture] = useState(false);
  const [sentence, setSentence] = useState('Hi my name is jashan');
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleCapture = (base64Image) => {
    detectSign(base64Image);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window && sentence) {
      const utterance = new SpeechSynthesisUtterance(sentence);
      
      // Attempt to find a female voice based on common OS voice names
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') || 
        voice.name.includes('Victoria') || 
        voice.name.includes('Zira') || 
        voice.name.includes('Google US English')
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } else if (!('speechSynthesis' in window)) {
      alert("Speech Synthesis is not supported in this browser.");
    }
  };

  return (
    <div className="app-container">
      <header className="app-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            background: 'var(--accent-primary)', 
            padding: '0.75rem', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
          }}>
            <Hand size={32} color="white" />
          </div>
          <div>
            <h1 className="app-title">SignLanguage AI</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Real-time gesture detection via custom backend
            </p>
          </div>
        </div>

        <button 
          className="glass-panel"
          onClick={toggleTheme}
          style={{
            padding: '0.75rem',
            border: '1px solid var(--glass-border)',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            background: 'var(--bg-card)'
          }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </header>

      <main className="main-content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <CameraFeed 
            onCapture={handleCapture} 
            autoCaptureInterval={autoCapture ? 1000 : null} 
          />
          
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  // The easiest way to manually capture is to toggle a state or call a ref.
                  // Since we passed onCapture, let's just trigger a click or handle it via a custom event, 
                  // or simpler: just keep the auto-capture toggle here.
                  setAutoCapture(!autoCapture);
                }}
                style={{
                  backgroundColor: autoCapture ? 'var(--error)' : 'var(--accent-primary)'
                }}
              >
                {autoCapture ? <Video size={18} /> : <Aperture size={18} />}
                {autoCapture ? 'Stop Auto-Detect' : 'Start Auto-Detect (1s)'}
              </button>
            </div>
            
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={16} />
              <span>Backend configured in config/api.js</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <DetectionPanel result={result} isDetecting={isDetecting} error={error} />
          
          {/* Sentence Builder Panel */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <MessageSquare size={20} /> Sentence Builder
            </h2>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  if (result && result.sign) {
                    setSentence(prev => prev ? prev + ' ' + result.sign : result.sign);
                  }
                }}
                disabled={!result || !result.sign}
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}
              >
                Add Word
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  if (result && result.sign) {
                    setSentence(prev => prev + result.sign);
                  }
                }}
                disabled={!result || !result.sign}
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}
              >
                Add Letter
              </button>
              <button 
                className="btn btn-primary" 
                onClick={() => setSentence(prev => prev + ' ')}
                style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem' }}
              >
                Space
              </button>
            </div>

            <div style={{
              minHeight: '80px',
              padding: '1rem',
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              fontSize: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              wordBreak: 'break-word'
            }}>
              {sentence || <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Your sentence will appear here...</span>}
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                className="btn" 
                style={{ backgroundColor: 'var(--error)' }} 
                onClick={() => setSentence('')} 
                disabled={!sentence}
              >
                <Trash2 size={18} /> Clear
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSpeak} 
                disabled={!sentence}
              >
                <Volume2 size={18} /> Speak
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
