import React from 'react';

export function FooterBar() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="left">
          <div className="tag">Powering the EVolution on World Mobile Chain</div>
          <div className="muted">Virtual DeCharge World — DePIN for connectivity and physical infrastructure.</div>
        </div>
        <nav className="links">
          <a href="https://worldmobile.io/the-chain" target="_blank" rel="noreferrer">WMC</a>
          <a href="https://grants.worldmobiletoken.com/" target="_blank" rel="noreferrer">WMC Grants</a>
          <a href="https://x.com/wmchain" target="_blank" rel="noreferrer">WMC X</a>
          <a href="https://worldmobile.io/" target="_blank" rel="noreferrer">World Mobile</a>
        </nav>
      </div>
    </footer>
  );
}
