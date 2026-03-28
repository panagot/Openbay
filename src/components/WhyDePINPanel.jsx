import React, { useState } from 'react';

/**
 * "Why DePIN?" — explains value for drivers vs owners (per AI feedback).
 */
export function WhyDePINPanel() {
  const [open, setOpen] = useState(false);
  return (
    <div className="panel why-depin-panel">
      <button type="button" className="why-depin-trigger" onClick={() => setOpen(!open)} aria-expanded={open}>
        Why this lab? <span className="why-depin-chevron">{open ? '▼' : '▶'}</span>
      </button>
      {open && (
        <div className="why-depin-content">
          <div className="why-depin-column">
            <h4>For drivers / fleets</h4>
            <ul>
              <li>One JSON shape for availability + session state (maps, agents, apps)</li>
              <li>Stablecoin-ready settlement on Solana (roadmap)</li>
            </ul>
          </div>
          <div className="why-depin-column">
            <h4>For charger hosts</h4>
            <ul>
              <li>P2P listing mental model — your pubkey, your revenue</li>
              <li>Optional Phantom “anchor” as a signed intent before real registry / Pay</li>
              <li>Open hooks for WiFi / OCPP telemetry later</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
