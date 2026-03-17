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
        <li><strong>Register your profile</strong> — Get a chain identity (DID) for your station(s) on X1 EcoChain; verifiable on-chain.</li>
        <li><strong>Set your spots & grid</strong> — Define how many charging spots you have; adjust the grid to match your lot.</li>
        <li><strong>Set your rates</strong> — Time-based or energy-based pricing per charge; you earn, drivers pay on X1.</li>
      </ul>
      <p className="muted" style={{ marginTop: 10, fontSize: '0.875rem' }}>
        With grant support: multi-location dashboard, real-world address registration, and verifiable session attestation on X1 EcoChain.
      </p>
      <Link to="/about" className="secondary" style={{ display: 'inline-block', marginTop: 8 }}>Why fund us →</Link>
    </div>
  );
}
