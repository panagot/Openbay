import React from 'react';
import { useWorldStore } from '../state/store.js';

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function RecentEventsStrip() {
  const events = useWorldStore(s => s.events).slice(0, 5);
  if (events.length === 0) return null;
  return (
    <div className="recent-strip">
      <span className="recent-strip-label">Recent:</span>
      <div className="recent-strip-inner">
        {events.map(e => (
          <span key={e.id} className={`chip ${e.kind || 'system'}`}>
            <span className="time">{formatTime(e.ts)}</span>
            <span className="dot" aria-hidden />
            <span className="text">{e.text}</span>
          </span>
        ))}
      </div>
    </div>
  );
}


