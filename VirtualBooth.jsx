import React, { useState } from 'react';
import { MessageSquare, Calendar, UserCheck, ExternalLink } from 'lucide-react';

const VirtualBooth = ({ booth, onSchedule }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="attendee-card">
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <div
          className="booth-logo"
          style={{
            width: 80,
            height: 80,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {booth.logo ? (
            <img src={booth.logo} alt={booth.name} style={{ maxWidth: '80%' }} />
          ) : (
            <ExternalLink opacity={0.5} />
          )}
        </div>
        <div>
          <h2 style={{ margin: 0 }}>{booth.name}</h2>
          <p style={{ margin: '4px 0', opacity: 0.8 }}>{booth.tagline}</p>
          <div className="tag-small" style={{ background: 'var(--primary-color)', color: 'white' }}>
            {booth.type}
          </div>
        </div>
      </div>

      <div className="booth-representative">
        <img
          src={booth.rep.avatar}
          alt={booth.rep.name}
          style={{ width: 40, height: 40, borderRadius: '50%' }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{booth.rep.name}</div>
          <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Booth Representative</div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <div className="status-dot online" title="Available for chat" />
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginTop: '1.5rem',
        }}
      >
        <button className="btn-primary" onClick={() => setIsChatOpen(true)}>
          <MessageSquare size={16} /> Chat Now
        </button>
        <button className="btn-secondary" onClick={() => onSchedule(booth.rep)}>
          <Calendar size={16} /> Schedule
        </button>
      </div>

      {isChatOpen && (
        <div
          className="chat-window-overlay"
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            width: 350,
            height: 450,
            background: 'var(--color-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px 12px 0 0',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            zIndex: 100,
          }}
        >
          <div
            style={{
              padding: '1rem',
              background: 'var(--primary-color)',
              color: 'white',
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>Chatting with {booth.rep.name}</span>
            <button
              onClick={() => setIsChatOpen(false)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              ×
            </button>
          </div>
          <div style={{ height: 340, padding: '1rem', overflowY: 'auto' }}>
            <div
              className="message-received"
              style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '8px 12px',
                borderRadius: 8,
                marginBottom: 8,
                maxWidth: '80%',
                fontSize: '0.9rem',
              }}
            >
              Hi! Thanks for visiting our booth. How can I help you today?
            </div>
          </div>
          <input
            type="text"
            placeholder="Type a message..."
            style={{
              width: '100%',
              border: 'none',
              borderTop: '1px solid var(--border-color)',
              padding: '1rem',
              outline: 'none',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default VirtualBooth;
