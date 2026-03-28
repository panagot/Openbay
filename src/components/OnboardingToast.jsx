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
        <div className="title">Welcome to OpenBay</div>
        <div className="muted">
          500 POINTS sandbox · multi-vertical catalog + Solana signing. Use <strong>Host</strong> vs{' '}
          <strong>OEM / integrator</strong> in the hero to simplify or show API panels.
        </div>
        <ol className="muted toast-steps">
          <li>Mint land → deploy node → start a session.</li>
          <li>Switch wallet to <strong>Phantom (Solana)</strong>, then <strong>Anchor on Solana</strong> to sign a station message.</li>
          <li>
            OEMs / gateways: read <strong>Hardware &amp; API onboarding</strong> in the sidebar, then <strong>API Lab</strong> for
            JSON, auth placeholders, and webhooks.
          </li>
        </ol>
        <div className="toast-actions">
          <button onClick={() => { setVisible(false); try { localStorage.setItem('vdw_onboard_seen', '1'); } catch {} }}>Got it</button>
          <button className="secondary" onClick={() => { try { localStorage.removeItem('vdw_state_v1'); localStorage.removeItem('vdw_state_v2'); location.reload(); } catch {} }}>Reset World</button>
        </div>
      </div>
    </div>
  );
}


