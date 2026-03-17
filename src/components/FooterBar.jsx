import React from 'react';

export function FooterBar() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="left">
          <div className="tag">Powering the EVolution on X1 EcoChain</div>
          <div className="muted">Virtual DeCharge World — DePIN for low-energy EV infrastructure on X1.</div>
        </div>
        <nav className="links">
          <a href="https://x1.eco" target="_blank" rel="noreferrer">X1 EcoChain</a>
          <a href="https://x.com/X1_EcoChain" target="_blank" rel="noreferrer">X1 X</a>
        </nav>
      </div>
    </footer>
  );
}
