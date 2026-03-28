import React from 'react';
import { paths } from '../constants/apiSurface.js';

const EXAMPLES = [
  {
    title: 'session.started',
    json: `{
  "event": "session.started",
  "event_id": "evt_01JQ…",
  "sequence_number": 1042,
  "created_at": 1710000000000,
  "plot_id": "2-3",
  "session_id": "sess_…",
  "device_id": "ocpp-001",
  "catalog_code": "EU-ATH-01"
}`,
  },
  {
    title: 'session.meter_tick',
    json: `{
  "event": "session.meter_tick",
  "event_id": "evt_01JR…",
  "sequence_number": 1043,
  "created_at": 1710000060000,
  "session_id": "sess_…",
  "meter_wh_delta": 1250,
  "schema_version": 1
}`,
  },
  {
    title: 'session.ended',
    json: `{
  "event": "session.ended",
  "event_id": "evt_01JS…",
  "sequence_number": 1044,
  "created_at": 1710001200000,
  "session_id": "sess_…",
  "total_wh": 18500,
  "points_settled": 420
}`,
  },
  {
    title: 'device.fault',
    json: `{
  "event": "device.fault",
  "event_id": "evt_01JT…",
  "sequence_number": 10,
  "created_at": 1710000300000,
  "device_id": "ocpp-001",
  "code": "CONNECTOR_LOCK",
  "message": "Connector failed to release"
}`,
  },
  {
    title: 'device.online (heartbeat)',
    json: `{
  "event": "device.online",
  "event_id": "evt_01JU…",
  "sequence_number": 11,
  "created_at": 1710000600000,
  "device_id": "ocpp-001",
  "firmware": "2.4.1"
}`,
  },
];

export function WebhookGuidePanel() {
  return (
    <div className="panel webhook-panel webhook-panel--guide">
      <h3>Outbound webhooks (planned)</h3>
      <p className="muted small">
        At-least-once delivery to your HTTPS URL. Instead of polling <code>{paths.sessions}</code>, subscribe to lifecycle
        events. Verify every request: <strong>HMAC</strong> over raw body (e.g. <code>sig</code> or{' '}
        <code>X-Signature</code>) + <code>X-Timestamp</code> with a short clock skew window to limit replay.
      </p>
      <div className="webhook-guide-grid">
        <div>
          <p className="webhook-panel-label">Retries &amp; DLQ</p>
          <p className="muted small">
            Exponential backoff with jitter (e.g. 1s → 2s → 5s → 15s…), cap attempts, 24–72h window. Failed deliveries
            land in a <strong>dead-letter queue</strong> for partner replay from a dashboard.
          </p>
        </div>
        <div>
          <p className="webhook-panel-label">Ordering</p>
          <p className="muted small">
            No global order guarantee. Include <code>event_id</code> (dedupe), <code>sequence_number</code> per device or
            session, and <code>created_at</code>. Receivers tolerate out-of-order delivery.
          </p>
        </div>
        <div>
          <p className="webhook-panel-label">Subscription API</p>
          <p className="muted small">
            Planned: <code>POST {paths.webhooks}</code> to register URL + <code>signing_secret</code>;
            replay via time range or <code>event_id</code> (retention 7–30 days).
          </p>
        </div>
      </div>
      <p className="muted small webhook-panel-label">Example payloads</p>
      <div className="webhook-examples">
        {EXAMPLES.map(ex => (
          <details key={ex.title} className="webhook-example-details">
            <summary>{ex.title}</summary>
            <pre className="openapi-pre openapi-pre--tight">{ex.json}</pre>
          </details>
        ))}
      </div>
      <p className="muted small" style={{ marginBottom: 0 }}>
        All examples omit <code>sig</code> / signing headers—same pattern as a single shared secret per subscription.
      </p>
    </div>
  );
}
