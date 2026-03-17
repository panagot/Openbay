import React from 'react';

export function FooterBar() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="left">
          <div className="tag">EV DePIN on X1 EcoChain</div>
          <div className="muted">Virtual DeCharge World — DePIN for low-energy EV infrastructure on X1.</div>
        </div>
        <nav className="links">
          <a href="https://x1ecochain.com/" target="_blank" rel="noreferrer">X1 EcoChain</a>
          <a href="https://ecosystem.x1ecochain.com/" target="_blank" rel="noreferrer">Ecosystem</a>
        </nav>
      </div>
    </footer>
  );
}
