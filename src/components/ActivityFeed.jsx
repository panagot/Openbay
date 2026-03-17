import React from 'react';
import { useWorldStore } from '../state/store.js';

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function ActivityFeed() {
  const events = useWorldStore(s => s.events).slice(0, 8);

  return (
    <div className="panel panel-activity">
      <h3>Activity</h3>
      <div className="feed">
        {events.length === 0 && <div className="muted feed-empty">No activity yet.</div>}
        {events.map(ev => (
          <div key={ev.id} className={`event event-oneline ${ev.kind || 'system'}`}>
            <span className="event-meta">{formatTime(ev.ts)}</span>
            <span className="event-dot" aria-hidden />
            <span className="event-text">{ev.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


