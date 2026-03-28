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
  onReserve,
  onCancelReservation,
  onRemoveCharger,
  onReleaseLand,
  isActive,
  user,
  solanaLoading,
  reservation,
}) {
  const ownerShort = plot.owner ? `${plot.owner.slice(0, 4)}…${plot.owner.slice(-4)}` : null;
  const hasCharger = plot.charger;
  const needsSolana =
    hasCharger && !plot.charger?.solanaAnchor && plot.charger?.owner === user?.pubkey;
  const isRegistering = solanaLoading === plot.id;
  const now = Date.now();
  const resActive = reservation && reservation.untilMs > now;
  const isChargerOwner = Boolean(user && hasCharger && plot.charger.owner === user.pubkey);
  const isPlotOwner = Boolean(user && plot.owner === user.pubkey);
  const isOthersNode = Boolean(user && hasCharger && plot.charger.owner !== user.pubkey);
  const isBooker = Boolean(resActive && user && reservation.bookerPubkey === user.pubkey);
  const canStartSession =
    hasCharger &&
    user &&
    (isChargerOwner || (resActive && reservation.bookerPubkey === user.pubkey));

  return (
    <div
      className={[
        'cell',
        plot.owner ? 'owned' : 'unowned',
        hasCharger ? 'has-charger' : '',
        isActive ? 'active' : '',
        resActive ? 'has-booking' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="coords">{plot.id}</div>
      {plot.owner && <div className="owner">{ownerShort}</div>}
      {plot.listing?.name && <div className="cell-listing">{plot.listing.name}</div>}
      {hasCharger && (
        <div className="charger">
          <span className="cell-rate">{plot.charger.ratePerSec}/s</span>{' '}
          {plot.charger.solanaAnchor && <span className="solana-badge">SOL</span>}
        </div>
      )}
      {resActive && (
        <div className="cell-booking-meta">
          {isBooker ? (
            <span className="cell-booking-you">Your booking</span>
          ) : (
            <span className="cell-booking-busy">Reserved</span>
          )}
          <span className="cell-booking-time">{new Date(reservation.untilMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )}
      <div className="actions">
        {!plot.owner && <button onClick={() => onMint(plot.id)}>Mint (50)</button>}
        {plot.owner && !plot.charger && (
          <button type="button" onClick={() => onDeploy(plot.id)}>
            Deploy node (100)
          </button>
        )}
        {isOthersNode && user && !isActive && !resActive && (
          <div className="cell-book-row">
            <span className="cell-book-label">Book</span>
            {[15, 30, 60].map(m => (
              <button key={m} type="button" className="tiny secondary" onClick={() => onReserve(plot.id, m)}>
                {m}m
              </button>
            ))}
          </div>
        )}
        {isBooker && !isActive && (
          <button type="button" className="secondary tiny" onClick={() => onCancelReservation(plot.id)}>
            Cancel booking
          </button>
        )}
        {hasCharger && !isActive && canStartSession && <button onClick={() => onStart(plot.id)}>Charge</button>}
        {isActive && (
          <button className="secondary" onClick={() => onStop(plot.id)}>
            Stop
          </button>
        )}
        {isPlotOwner && hasCharger && !isActive && (
          <button
            type="button"
            className="secondary tiny"
            onClick={() => onRemoveCharger(plot.id)}
            title="Undeploy node (~70% stake back)"
          >
            Remove node
          </button>
        )}
        {isPlotOwner && !hasCharger && (
          <button type="button" className="secondary tiny" onClick={() => onReleaseLand(plot.id)} title="Release empty plot">
            Release land
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
  const reservations = useWorldStore(s => s.reservations);
  const user = useWorldStore(s => s.user);

  const mintLand = useWorldStore(s => s.mintLand);
  const deployCharger = useWorldStore(s => s.deployCharger);
  const startSession = useWorldStore(s => s.startSession);
  const stopSession = useWorldStore(s => s.stopSession);
  const reserveSpot = useWorldStore(s => s.reserveSpot);
  const cancelReservation = useWorldStore(s => s.cancelReservation);
  const removeCharger = useWorldStore(s => s.removeCharger);
  const releaseLand = useWorldStore(s => s.releaseLand);
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

  const handleReserve = (plotId, durationMins) => {
    setError('');
    try {
      reserveSpot(plotId, durationMins);
    } catch (e) {
      setError(e.message);
      pushEvent('error', e.message);
    }
  };

  const handleCancelReservation = plotId => {
    setError('');
    try {
      cancelReservation(plotId);
    } catch (e) {
      setError(e.message);
      pushEvent('error', e.message);
    }
  };

  const handleRemoveCharger = plotId => {
    if (!window.confirm(`Remove node on ${plotId}?`)) return;
    setError('');
    try {
      removeCharger(plotId);
    } catch (e) {
      setError(e.message);
      pushEvent('error', e.message);
    }
  };

  const handleReleaseLand = plotId => {
    if (!window.confirm(`Release land ${plotId}?`)) return;
    setError('');
    try {
      releaseLand(plotId);
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
            {rows}×{cols} cells · mint, deploy, book, simulate sessions
          </p>
        </div>
        <div className="legend legend--inline" aria-label="Legend">
          <span className="badge owned">Owned</span>
          <span className="badge has-charger">Node</span>
          <span className="badge active">Active</span>
          <span className="badge booking-legend">Booked window</span>
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
            onReserve={handleReserve}
            onCancelReservation={handleCancelReservation}
            onRemoveCharger={handleRemoveCharger}
            onReleaseLand={handleReleaseLand}
            isActive={!!sessions[plot.id]}
            solanaLoading={solanaLoading}
            reservation={reservations[plot.id]}
          />
        ))}
      </div>
    </div>
  );
}
