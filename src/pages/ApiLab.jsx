import React from 'react';
import { Link } from 'react-router-dom';
import { OpenApiPanel } from '../components/OpenApiPanel.jsx';
import { HardwareApiPanel } from '../components/HardwareApiPanel.jsx';
import { WebhookGuidePanel } from '../components/WebhookGuidePanel.jsx';
import { PersonaToggle } from '../components/PersonaToggle.jsx';
import { usePersona } from '../context/PersonaContext.jsx';

export function ApiLab() {
  const { persona } = usePersona();
  return (
    <div className="app api-lab-page">
      <header className="walletbar">
        <div className="brand-wrap">
          <div className="brand">
            <span>OpenBay</span>
          </div>
          <div className="slogan">Hardware-agnostic API · same contract from sandbox to edge</div>
        </div>
        <div className="walletbar-lab-actions">
          <PersonaToggle idPrefix="lab" />
          <Link to="/" className="header-btn">
            ← App
          </Link>
        </div>
      </header>
      {persona === 'host' && (
        <div className="api-lab-host-banner" role="status">
          <strong>Host view</strong> — you are in simplified mode. Switch to <strong>OEM / integrator</strong> for the full
          technical sidebar context; this page always shows integrator-grade docs.
        </div>
      )}
      <main className="api-lab-main api-lab-split">
        <div className="api-lab-col api-lab-col--primary">
          <OpenApiPanel compact={false} />
        </div>
        <aside className="api-lab-col api-lab-col--side" aria-label="Integration guides">
          <HardwareApiPanel variant="compact" />
          <WebhookGuidePanel />
          <div className="panel">
            <h3>Next integrations</h3>
            <ul className="station-owner-steps">
              <li>
                <strong>Catalog verticals</strong> — EV, home battery / flex load, e-bike lockers, marina &amp; RV, parking
                &amp; loading bays, storage &amp; maker space, Starlink / edge Pi / sensor aggregates, civic (tools, fridge,
                water, mobility corner).
              </li>
              <li>
                <strong>Connectors / ports</strong> — EVSE ports, marina pedestals, etc. as sub-resources on a station
                (planned); sessions attach to a connector.
              </li>
              <li>
                <strong>OCPP / Wi-Fi gateway</strong> — Pi posts <code>meter_wh</code> + optional batching to telemetry.
              </li>
              <li>
                <strong>Solana Pay</strong> — QR session invoices; host pubkey receives USDC.
              </li>
              <li>
                <strong>Agents</strong> — same JSON; automated wallet polls and pays.
              </li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
