import React, { useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useWorldStore } from '../state/store.js';
import { paths } from '../constants/apiSurface.js';

const OPENAPI_STUB_RAW =
  'https://raw.githubusercontent.com/panagot/Openbay/master/docs/openapi-openbay-stub.yaml';

export function OpenApiPanel({ compact = false }) {
  const [tab, setTab] = useState('stations');
  const [copyState, setCopyState] = useState(null);
  const grid = useWorldStore(s => s.grid);
  const sessions = useWorldStore(s => s.sessions);
  const cpToPlot = useWorldStore(s => s.cpToPlot);
  const cpMeta = useWorldStore(s => s.cpMeta);
  const reservations = useWorldStore(s => s.reservations);
  const user = useWorldStore(s => s.user);

  const base = typeof window !== 'undefined' ? window.location.origin : '';

  const plotToCatalogCode = useMemo(() => {
    const m = {};
    Object.entries(cpToPlot).forEach(([code, plotId]) => {
      m[plotId] = code;
    });
    return m;
  }, [cpToPlot]);

  const stationsPayload = useMemo(
    () =>
      grid
        .filter(p => p.charger)
        .map(p => {
          const code = plotToCatalogCode[p.id] || null;
          const meta = code ? cpMeta[code] : null;
          const res = reservations[p.id];
          const list = p.listing;
          return {
            plot_id: p.id,
            catalog_code: code,
            category: meta?.category ?? null,
            category_label: list?.category_label ?? meta?.category_label ?? null,
            vertical: list?.vertical ?? meta?.vertical ?? null,
            listed_name: list?.name ?? meta?.name ?? null,
            power_kw: list?.powerKw ?? meta?.powerKw ?? null,
            owner: p.charger.owner,
            rate_per_sec: p.charger.ratePerSec,
            solana_anchor: p.charger.solanaAnchor || null,
            session_active: Boolean(sessions[p.id]),
            booking: res
              ? {
                  until_ms: res.untilMs,
                  booker: `${res.bookerPubkey.slice(0, 6)}…${res.bookerPubkey.slice(-4)}`,
                  fee_points: res.feePoints,
                }
              : null,
          };
        }),
    [grid, sessions, plotToCatalogCode, cpMeta, reservations],
  );

  const sessionPayload = useMemo(() => {
    const active = Object.entries(sessions).map(([plotId, s]) => ({
      plot_id: plotId,
      driver: s.driver,
      rate_per_sec: s.ratePerSec,
      started_at: s.startTs,
    }));
    return { active, count: active.length };
  }, [sessions]);

  const copy = useCallback(async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState(id);
      window.setTimeout(() => setCopyState(s => (s === id ? null : s)), 2000);
    } catch {
      const errKey = `err:${id}`;
      setCopyState(errKey);
      window.setTimeout(() => setCopyState(s => (s === errKey ? null : s)), 2500);
    }
  }, []);

  const stationsJson = JSON.stringify(stationsPayload, null, 2);
  const sessionsJson = JSON.stringify(sessionPayload, null, 2);

  const curlStations = `curl -s "${base}${paths.stations}" \\
  -H "Accept: application/json" \\
  -H "Authorization: Bearer <api_key_sandbox>"`;

  const curlSessions = `curl -s "${base}${paths.sessions}" \\
  -H "Accept: application/json" \\
  -H "Authorization: Bearer <api_key_sandbox>"`;

  const curlStart = `curl -s -X POST "${base}${paths.sessionsStart}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <api_key_sandbox>" \\
  -H "Idempotency-Key: <uuid>" \\
  -d '{"plot_id":"0-0","driver_pubkey":"<wallet>"}'`;

  const curlTelemetry = `curl -s -X POST "${base}${paths.telemetry}" \\
  -H "Authorization: Bearer <api_key_sandbox>" \\
  -H "Idempotency-Key: 7f2a8c1e-4b3d-4a1e-9c0f-123456789abc" \\
  -H "Content-Type: application/json" \\
  -d '{"device_id":"gw-001","schema_version":1,"meter_wh":1.25,"observed_at":1710000000000}'`;

  const curlDevices = `curl -s -X POST "${base}${paths.devices}" \\
  -H "Authorization: Bearer <api_key_sandbox>" \\
  -H "Idempotency-Key: <uuid>" \\
  -H "Content-Type: application/json" \\
  -d '{"device_id":"ocpp-001","capabilities":["ev_dc"],"lat":48.2,"lng":16.3}'`;

  const copyLabel = id => {
    if (copyState === `err:${id}`) return 'Copy failed';
    if (copyState === id) return 'Copied';
    return 'Copy JSON';
  };

  return (
    <div className={`panel openapi-panel ${compact ? 'openapi-compact' : ''}`}>
      <h3>Open API (experiment)</h3>
      <p className="muted openapi-lead">
        Same JSON shape we intend to host for fleets, maps, and agents. <strong>Not hosted yet</strong> — this is a{' '}
        <strong>browser-only mock</strong> (stable schema). Production will use <strong>separate sandbox vs live API keys</strong>{' '}
        and server-side validation; nothing here enforces auth or idempotency.
      </p>
      <div className="openapi-spec-row">
        <span className="sandbox-strip-badge openapi-mock-pill">Mock export</span>
        <a
          className="openapi-spec-link"
          href={OPENAPI_STUB_RAW}
          target="_blank"
          rel="noreferrer"
          download="openapi-openbay-stub.yaml"
        >
          OpenAPI stub (YAML) — repo
        </a>
      </div>
      {!compact && (
        <div className="openapi-tabs">
          <button type="button" className={tab === 'stations' ? 'active' : ''} onClick={() => setTab('stations')}>
            GET {paths.stations}
          </button>
          <button type="button" className={tab === 'sessions' ? 'active' : ''} onClick={() => setTab('sessions')}>
            GET {paths.sessions}
          </button>
          <button type="button" className={tab === 'auth' ? 'active' : ''} onClick={() => setTab('auth')}>
            Auth
          </button>
          <button type="button" className={tab === 'docs' ? 'active' : ''} onClick={() => setTab('docs')}>
            cURL
          </button>
        </div>
      )}

      {(tab === 'stations' || compact) && (
        <div className="openapi-block">
          <div className="openapi-row">
            <code className="openapi-path">GET {paths.stations}</code>
            <button type="button" className="secondary tiny" onClick={() => copy(stationsJson, 'stations')}>
              {copyLabel('stations')}
            </button>
          </div>
          <pre className="openapi-pre">{stationsJson}</pre>
        </div>
      )}

      {tab === 'sessions' && !compact && (
        <div className="openapi-block">
          <div className="openapi-row">
            <code className="openapi-path">GET {paths.sessions}</code>
            <button type="button" className="secondary tiny" onClick={() => copy(sessionsJson, 'sessions')}>
              {copyLabel('sessions')}
            </button>
          </div>
          <pre className="openapi-pre">{sessionsJson}</pre>
        </div>
      )}

      {tab === 'auth' && !compact && (
        <div className="openapi-block openapi-auth-block">
          <p className="muted small">
            <strong>Wallet ≠ device.</strong> Phantom in the browser is for host ownership demos. Gateways use{' '}
            <strong>API keys or certs</strong> on the device or edge; the backend verifies telemetry signatures and issues
            sessions.
          </p>
          <ul className="muted small openapi-auth-list">
            <li>
              <code>Authorization: Bearer &lt;api_key_sandbox | api_key_live&gt;</code> — machine-to-machine; keys scoped
              per environment.
            </li>
            <li>
              <code>Idempotency-Key: &lt;uuid&gt;</code> — on <code>POST {paths.devices}</code>,{' '}
              <code>POST {paths.telemetry}</code>, and mutating session calls (safe retries).
            </li>
            <li>
              Responses (planned): <code>X-RateLimit-Limit</code>, <code>X-RateLimit-Remaining</code>,{' '}
              <code>Retry-After</code> when throttled.
            </li>
            <li>
              Optional <code>Authorization: Bearer &lt;oauth_access_token&gt;</code> — delegated user flows.
            </li>
            <li>
              Optional <strong>mTLS</strong> for high-trust OEM pipes (later phase; API keys + HMAC first).
            </li>
          </ul>
          <p className="muted small">Telemetry signing: HMAC or Ed25519 with a device secret from provisioning (preferred on Pi / enclosure).</p>
          <p className="muted small openapi-auth-label">Error envelope (planned)</p>
          <pre className="openapi-pre openapi-pre--tight openapi-pre--error">{`{
  "error": {
    "code": "DEVICE_NOT_FOUND",
    "message": "Unknown device_id",
    "request_id": "req_01JQ…"
  }
}`}</pre>
        </div>
      )}

      {tab === 'docs' && !compact && (
        <div className="openapi-block">
          <p className="muted small">
            Replace origin after you deploy an API. Use <strong>sandbox</strong> keys only against a test project;
            <code> Idempotency-Key</code> and rate-limit headers apply in production.
          </p>
          <p className="muted small openapi-auth-label">Read</p>
          <pre className="openapi-pre">{curlStations}</pre>
          <pre className="openapi-pre">{curlSessions}</pre>
          <p className="muted small openapi-auth-label">Write (devices &amp; telemetry)</p>
          <pre className="openapi-pre">{curlDevices}</pre>
          <pre className="openapi-pre">{curlTelemetry}</pre>
          <p className="muted small openapi-auth-label">Session</p>
          <pre className="openapi-pre">{curlStart}</pre>
        </div>
      )}

      {compact && (
        <p className="muted small openapi-compact-more">
          <Link to="/lab">Open API Lab</Link> for <code>{paths.sessions}</code>, cURL, <strong>Auth</strong>, and webhook
          examples.
        </p>
      )}

      {user && (
        <p className="muted small openapi-foot">
          Viewer wallet: <code>{user.pubkey.slice(0, 8)}…</code> · Phantom anchors store a signed station message locally.
        </p>
      )}
    </div>
  );
}
