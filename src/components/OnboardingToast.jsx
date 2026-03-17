import React, { useEffect, useState } from 'react';

export function OnboardingToast() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    try {
      const seen = localStorage.getItem('vdw_onboard_seen');
      if (!seen) setVisible(true);
    } catch {}
  }, []);

  if (!visible) return null;
  return (
    <div className="toast">
      <div className="toast-content">
        <div className="title">Welcome to Virtual DeCharge World on World Mobile Chain</div>
        <div className="muted">You have 500 POINTS to start. DePIN for the Machine Economy.</div>
        <ol className="muted" style={{ margin: '8px 0 0 18px' }}>
          <li>Mint a plot and deploy a charger on the grid (or Spawn from sample charge points).</li>
          <li>Switch to Map and start a session from a marker. Add <code>VITE_GOOGLE_MAPS_API_KEY</code> in .env for full Google Maps.</li>
          <li>Connect MetaMask to register chargers on WMC (chain identity). Watch the Activity feed.</li>
        </ol>
        <div className="toast-actions">
          <button onClick={() => { setVisible(false); try { localStorage.setItem('vdw_onboard_seen', '1'); } catch {} }}>Got it</button>
          <button className="secondary" onClick={() => { try { localStorage.removeItem('vdw_state_v1'); location.reload(); } catch {} }}>Reset World</button>
        </div>
      </div>
    </div>
  );
}


