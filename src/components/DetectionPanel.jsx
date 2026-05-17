import React from 'react';
import { Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function DetectionPanel({ result, isDetecting, error }) {
  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
        <Activity size={20} /> Detection Results
      </h2>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        {error ? (
          <div style={{ color: 'var(--error)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={48} />
            <p>{error}</p>
          </div>
        ) : isDetecting && !result ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid var(--glass-border)',
              borderTopColor: 'var(--accent-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: 'var(--text-secondary)' }}>Analyzing frame...</p>
            <style>{`
              @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
          </div>
        ) : result ? (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
            <div style={{ 
              fontSize: '4rem', 
              fontWeight: '700', 
              color: 'var(--accent-primary)',
              textShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
            }}>
              {result.sign}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)' }}>
              <CheckCircle2 size={20} />
              <span style={{ fontSize: '1.2rem', fontWeight: '500' }}>
                {(result.confidence * 100).toFixed(1)}% Confidence
              </span>
            </div>
            
            <div style={{ 
              width: '100%', 
              height: '8px', 
              background: 'var(--bg-secondary)', 
              borderRadius: '4px',
              overflow: 'hidden',
              marginTop: '1rem'
            }}>
              <div style={{ 
                height: '100%', 
                width: `${result.confidence * 100}%`,
                background: 'linear-gradient(90deg, var(--accent-primary), var(--success))',
                transition: 'width 0.3s ease-out'
              }} />
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Activity size={48} style={{ opacity: 0.2 }} />
            <p>Waiting for capture...</p>
          </div>
        )}
      </div>
    </div>
  );
}
