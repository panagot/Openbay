import React from 'react';

export function FooterBar() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="left">
          <div className="tag">OpenBay</div>
          <div className="muted">Phantom anchoring + Open API export. Sandbox only — not production infrastructure software.</div>
        </div>
        <nav className="links">
          <a href="https://github.com/panagot/Openbay" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://solana.com/" target="_blank" rel="noreferrer">Solana</a>
          <a href="https://phantom.app/" target="_blank" rel="noreferrer">Phantom</a>
          <a href="https://solana.com/solana-pay" target="_blank" rel="noreferrer">Solana Pay</a>
        </nav>
      </div>
    </footer>
  );
}
