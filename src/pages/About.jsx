import React from 'react';
import { Link } from 'react-router-dom';
import { FooterBar } from '../components/FooterBar.jsx';
import { WalletBar } from '../components/WalletBar.jsx';
import { StatsHeader } from '../components/StatsHeader.jsx';

export function About() {
  return (
    <div className="app">
      <WalletBar />
      <StatsHeader />
      <main className="layout">
        <section className="left">
          <h2>OpenBay</h2>
          <p className="muted">
            A sandbox for <strong>P2P-style physical nodes</strong>: EV supply, home energy flex, micromobility, marina/RV,
            parking and loading, maker/storage space, connectivity/edge, and small civic utilities. The UI uses a grid +
            map + simulated POINTS sessions; production would add real telemetry and <strong>Solana Pay</strong> settlement.
          </p>

          <div className="panel">
            <h3>Wallets</h3>
            <ul>
              <li>
                <strong>Local Dev Wallet</strong> — auto-generated (ethers); 500 POINTS to learn the loop.
              </li>
              <li>
                <strong>Phantom</strong> — connect to sign <em>Anchor on Solana</em> messages for stations you deploy (demo
                attestation, not an on-chain registry yet).
              </li>
            </ul>
          </div>

          <div className="panel">
            <h3>Grant / product angles</h3>
            <ul>
              <li>
                <strong>Payments &amp; Commerce</strong> — Solana Pay + USDC session invoices (roadmap).
              </li>
              <li>
                <strong>Developer tooling</strong> — OpenAPI-shaped JSON in <Link to="/lab">API Lab</Link>.
              </li>
              <li>
                <strong>Education</strong> — workshop: spawn catalog nodes → session → Phantom anchor → copy API JSON.
              </li>
            </ul>
          </div>

          <div className="panel">
            <h3>Links</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a className="secondary" href="https://solana.com/solana-pay" target="_blank" rel="noreferrer">
                Solana Pay
              </a>
              <a className="secondary" href="https://phantom.app/" target="_blank" rel="noreferrer">
                Phantom
              </a>
              <a className="secondary" href="https://solana.com/" target="_blank" rel="noreferrer">
                Solana
              </a>
            </div>
          </div>

          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link to="/">
              <button type="button">Back to App</button>
            </Link>
            <Link to="/lab">
              <button type="button" className="secondary">
                API Lab
              </button>
            </Link>
          </div>
        </section>
        <section className="right">
          <div className="panel">
            <h3>Disclaimer</h3>
            <p className="muted small">
              Not certified charging or utility software. Sessions and POINTS are simulated. Electrical, grid, and local
              rules are the operator&apos;s responsibility.
            </p>
          </div>
        </section>
      </main>
      <FooterBar />
    </div>
  );
}
