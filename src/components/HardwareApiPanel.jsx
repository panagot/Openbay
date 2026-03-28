import React from 'react';
import { Link } from 'react-router-dom';
import { paths } from '../constants/apiSurface.js';

/**
 * OEM / gateway narrative: how physical products join the same contract as the sandbox.
 */
export function HardwareApiPanel({ variant = 'sidebar' }) {
  const dense = variant === 'compact';
  return (
    <div className={`panel hardware-api-panel ${dense ? 'hardware-api-panel--compact' : ''}`}>
      <h3>{dense ? 'Hardware hookup' : 'Hardware & API onboarding'}</h3>
      <p className="muted small hardware-api-lead">
        <strong>Sandbox vs production:</strong> this UI never validates API keys or Solana on a server. Phantom{' '}
        <code>signMessage</code> is a <strong>browser demo</strong> for host intent; real gateways should use{' '}
        <strong>device- or server-issued credentials</strong> and sign telemetry in firmware or a trusted edge.
      </p>
      <p className="muted small hardware-api-lead" style={{ marginTop: 8 }}>
        Chargers, OCPP gateways, Pis, and OEM fleets list devices and stream telemetry against the{' '}
        <strong>same JSON contract</strong> you export here—no separate vendor UI required.
      </p>
      <ol className="hardware-steps">
        <li>
          <strong>Credentials</strong> — separate <strong>sandbox</strong> vs <strong>live</strong> keys (planned naming
          e.g. <code>dc_test_…</code> / <code>dc_live_…</code>); OAuth for delegated access.{' '}
          <span className="hardware-api-note">Not enforced in-browser.</span>
        </li>
        <li>
          <strong>Register / upsert</strong> —{' '}
          <code>POST {paths.devices}</code> with <code>Idempotency-Key</code> header (retries on flaky IoT links).
        </li>
        <li>
          <strong>Telemetry</strong> — <code>POST {paths.telemetry}</code> with <code>Idempotency-Key</code>,{' '}
          <code>schema_version</code> in body; optional batch endpoint later. Include{' '}
          <code>X-RateLimit-*</code> / <code>Retry-After</code> responses (e.g. ~100 posts/min/device in sandbox).
        </li>
        <li>
          <strong>Discovery</strong> — <code>GET {paths.stations}</code> with filters (<code>bbox</code>, vertical,
          availability — planned); webhooks for push.
        </li>
      </ol>
      {!dense && (
        <div className="hardware-api-callout">
          <span className="hardware-api-callout-label">Seamless path</span>
          <p className="muted small hardware-api-callout-text">
            One schema from demo → staging API → production edge. Map/grid here only <em>simulates</em> what your hardware
            drives.
          </p>
        </div>
      )}
      <details className="hardware-hardening-details">
        <summary>Production hardening (idempotency, attestation, errors, OTA)</summary>
        <ul className="muted small hardware-hardening-list">
          <li>
            <strong>Idempotency-Key</strong> on <code>POST {paths.devices}</code> and <code>POST {paths.telemetry}</code>{' '}
            — required for safe retries over cellular / marina Wi‑Fi.
          </li>
          <li>
            <strong>Device attestation</strong> — gateway proves control via backend-issued nonce signed with device key
            (secure element / Ed25519); do not treat browser Phantom as hardware identity.
          </li>
          <li>
            <strong>Errors</strong> — structured envelope e.g.{' '}
            <code>{`{ "error": { "code": "DEVICE_NOT_FOUND", "message": "…", "request_id": "…" } }`}</code>.
          </li>
          <li>
            <strong>OTA / firmware</strong> — platform or partner channel to push approved images to gateways (policy +
            versioning TBD).
          </li>
          <li>
            <strong>Gateway vs station</strong> — one physical <em>gateway</em> may expose multiple logical stations /
            connectors (future <code>/gateways</code> or nested resources).
          </li>
        </ul>
      </details>
      <p className="muted small hardware-api-footer">
        <Link to="/lab">API Lab</Link>
        {dense ? ' — full endpoints, cURL, auth, webhooks.' : ' — live JSON export, cURL, auth & expanded webhooks.'}
      </p>
    </div>
  );
}
