import React, { useState } from 'react';

/**
 * "Why DePIN?" — explains value for drivers vs owners (per AI feedback).
 */
export function WhyDePINPanel() {
  const [open, setOpen] = useState(false);
  return (
    <div className="panel why-depin-panel">
      <button type="button" className="why-depin-trigger" onClick={() => setOpen(!open)} aria-expanded={open}>
        Why DePIN? <span className="why-depin-chevron">{open ? '▼' : '▶'}</span>
      </button>
      {open && (
        <div className="why-depin-content">
          <div className="why-depin-column">
            <h4>For drivers</h4>
            <ul>
              <li>Verified stations — identity and history on-chain</li>
              <li>Transparent pricing — no hidden fees</li>
            </ul>
          </div>
          <div className="why-depin-column">
            <h4>For station owners</h4>
            <ul>
              <li>Own your data — usage and reputation stay with your machine ID</li>
              <li>Keep 100% of profit — direct payments, no middleman</li>
              <li>Build a public reputation — verifiable session history</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
