import React, { useMemo, useState } from 'react';
import { useWorldStore } from '../state/store.js';
import { anchorStationWithPhantom } from '../solana/solanaService.js';

function PlotCell({
  plot,
  onMint,
  onDeploy,
  onStart,
  onStop,
  onRegisterSolana,
  isActive,
  user,
  solanaLoading,
}) {
  const ownerShort = plot.owner ? `${plot.owner.slice(0, 4)}…${plot.owner.slice(-4)}` : null;
  const hasCharger = plot.charger;
  const needsSolana =
    hasCharger && !plot.charger?.solanaAnchor && plot.charger?.owner === user?.pubkey;
  const isRegistering = solanaLoading === plot.id;
  return (
    <div
      className={['cell', plot.owner ? 'owned' : 'unowned', hasCharger ? 'has-charger' : '', isActive ? 'active' : '']
        .filter(Boolean)
        .join(' ')}
    >
      <div className="coords">{plot.id}</div>
      {plot.owner && <div className="owner">{ownerShort}</div>}
      {hasCharger && (
        <div className="charger">
          <span className="cell-rate">{plot.charger.ratePerSec}/s</span>{' '}
          {plot.charger.solanaAnchor && <span className="solana-badge">SOL</span>}
        </div>
      )}
      <div className="actions">
        {!plot.owner && <button onClick={() => onMint(plot.id)}>Mint (50)</button>}
        {plot.owner && !plot.charger && (
          <button type="button" onClick={() => onDeploy(plot.id)}>
            Deploy node (100)
          </button>
        )}
        {hasCharger && !isActive && <button onClick={() => onStart(plot.id)}>Charge</button>}
        {isActive && (
          <button className="secondary" onClick={() => onStop(plot.id)}>
            Stop
          </button>
        )}
        {needsSolana && (
          <div className="solana-register-wrap">
            <button
              className="solana-btn"
              type="button"
              onClick={() => onRegisterSolana(plot)}
              disabled={isRegistering}
              title="Sign a station message with Phantom (experiment)."
            >
              {isRegistering ? '…' : 'Anchor on Solana'}
            </button>
            <span className="solana-register-hint">Signed message · Phantom</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function MapGrid() {
  const grid = useWorldStore(s => s.grid);
  const rows = useWorldStore(s => s.rows);
  const cols = useWorldStore(s => s.cols);
  const sessions = useWorldStore(s => s.sessions);
  const user = useWorldStore(s => s.user);

  const mintLand = useWorldStore(s => s.mintLand);
  const deployCharger = useWorldStore(s => s.deployCharger);
  const startSession = useWorldStore(s => s.startSession);
  const stopSession = useWorldStore(s => s.stopSession);
  const updateChargerSolanaAnchor = useWorldStore(s => s.updateChargerSolanaAnchor);
  const pushEvent = useWorldStore(s => s.pushEvent);

  const [error, setError] = useState('');
  const [solanaLoading, setSolanaLoading] = useState(null);

  const handle = fn => async plotId => {
    setError('');
    try {
      await fn(plotId);
    } catch (e) {
      setError(e.message);
      pushEvent('error', e.message);
    }
  };

  const handleRegisterSolana = async plot => {
    if (!user || !plot.charger) return;
    if (user.walletKind !== 'solana') {
      setError('Select “Phantom (Solana)” in the wallet bar, then try again.');
      pushEvent('error', 'Anchor requires Phantom — switch wallet mode.');
      return;
    }
    setError('');
    setSolanaLoading(plot.id);
    try {
      const chargerId = `charger-${plot.id}`;
      const { stationId, sigPreview } = await anchorStationWithPhantom({
        chargerId,
        ownerBase58: user.pubkey,
        plotId: plot.id,
      });
      updateChargerSolanaAnchor(plot.id, stationId, sigPreview);
    } catch (e) {
      setError(e.message);
      pushEvent('error', e.message);
    } finally {
      setSolanaLoading(null);
    }
  };

  const byRow = useMemo(() => {
    const r = Array.from({ length: rows }, () => []);
    grid.forEach(p => {
      r[p.row].push(p);
    });
    r.forEach(arr => arr.sort((a, b) => a.col - b.col));
    return r;
  }, [grid, rows]);

  return (
    <div className="workspace-panel workspace-panel--grid">
      {error && <div className="error">{error}</div>}
      <header className="workspace-panel__head">
        <div className="workspace-panel__intro">
          <h3 className="workspace-panel__title">Slot grid</h3>
          <p className="workspace-panel__meta">
            {rows}×{cols} cells · mint, deploy, simulate sessions
          </p>
        </div>
        <div className="legend legend--inline" aria-label="Legend">
          <span className="badge owned">Owned</span>
          <span className="badge has-charger">Node</span>
          <span className="badge active">Active</span>
          <span className="badge solana-legend">Anchored</span>
        </div>
      </header>
      <div className="grid grid-world" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {byRow.flat().map(plot => (
          <PlotCell
            key={plot.id}
            plot={plot}
            user={user}
            onMint={handle(mintLand)}
            onDeploy={handle(deployCharger)}
            onStart={handle(startSession)}
            onStop={handle(stopSession)}
            onRegisterSolana={handleRegisterSolana}
            isActive={!!sessions[plot.id]}
            solanaLoading={solanaLoading}
          />
        ))}
      </div>
    </div>
  );
}
