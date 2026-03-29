import React from 'react';

/** Sets expectations: browser-only demo vs future hosted API / on-chain product. */
export function SandboxModeStrip({ compact = false }) {
  return (
    <div className={`sandbox-strip${compact ? ' sandbox-strip--compact' : ''}`} role="status">
      <span className="sandbox-strip-badge">Sandbox</span>
      {compact ? (
        <span className="sandbox-strip-text">
          Browser-only mock — JSON export is local; <strong>no hosted API</strong>. Phantom anchor = <code>signMessage</code>{' '}
          demo, not a transaction.
        </span>
      ) : (
        <span className="sandbox-strip-text">
          Map catalog and <strong>POINTS</strong> run in your browser (localStorage). <strong>No hosted API yet</strong> — the
          Open API panels show the contract we intend to ship. Phantom &quot;Anchor on Solana&quot; stores a signed message
          locally; it is <strong>not</strong> an on-chain deployment in this demo.
        </span>
      )}
    </div>
  );
}
