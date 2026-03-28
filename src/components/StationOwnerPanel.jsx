import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Panel for grant judges & entrepreneurs: explains how station owners
 * can map their address, register profile, set spots/grids and rates.
 */
export function StationOwnerPanel() {
  return (
    <div className="panel station-owner-panel">
      <h3>For station owners & entrepreneurs</h3>
      <p className="muted" style={{ marginBottom: 12 }}>
        Real yield from physical chargers. This grid is your garage layout — scale to many locations.
      </p>
      <ul className="station-owner-steps">
        <li><strong>Pin your address</strong> — Point to your location on the map and register it.</li>
        <li><strong>Anchors (Solana)</strong> — Connect Phantom, deploy a charger, click <em>Anchor on Solana</em> to sign a station message (demo intent).</li>
        <li><strong>Set your spots &amp; grid</strong> — Garage-style layout in the UI; real backends can mirror many locations later.</li>
        <li><strong>Rates & settlement</strong> — Today: POINTS tick loop. Tomorrow: USDC via Solana Pay + meter telemetry.</li>
      </ul>
      <p className="muted" style={{ marginTop: 10, fontSize: '0.875rem' }}>
        Open <Link to="/lab">API Lab</Link> for the JSON we want fleets and agents to consume.
      </p>
      <Link to="/about" className="secondary" style={{ display: 'inline-block', marginTop: 8 }}>Why fund us →</Link>
    </div>
  );
}
