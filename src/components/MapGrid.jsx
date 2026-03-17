import React, { useMemo, useState } from 'react';
import { useWorldStore } from '../state/store.js';
import { registerChargerOnX1 } from '../x1/x1Service.js';

function PlotCell({ plot, onMint, onDeploy, onStart, onStop, onRegisterX1, isActive, user, x1Loading }) {
  const ownerShort = plot.owner ? `${plot.owner.slice(0, 4)}…${plot.owner.slice(-4)}` : null;
  const hasCharger = plot.charger;
  const needsX1 = hasCharger && !plot.charger?.peaqDid && plot.charger?.owner === user?.pubkey;
  const isRegistering = x1Loading === plot.id;
  return (
    <div className={['cell', plot.owner ? 'owned' : 'unowned', hasCharger ? 'has-charger' : '', isActive ? 'active' : ''].join(' ')}>
      <div className="coords">{plot.id}</div>
      {plot.owner && <div className="owner">{ownerShort}</div>}
      {hasCharger && <div className="charger">⚡ {plot.charger.ratePerSec}/s {plot.charger.peaqDid && <span className="peaq-badge">X1</span>}</div>}
      <div className="actions">
        {!plot.owner && (
          <button onClick={() => onMint(plot.id)}>Mint (50)</button>
        )}
        {plot.owner && !plot.charger && (
          <button onClick={() => onDeploy(plot.id)}>Deploy (stake 100)</button>
        )}
        {hasCharger && !isActive && (
          <button onClick={() => onStart(plot.id)}>Charge</button>
        )}
        {isActive && (
          <button className="secondary" onClick={() => onStop(plot.id)}>Stop</button>
        )}
        {needsX1 && (
          <div className="peaq-register-wrap">
            <button className="peaq-btn" onClick={() => onRegisterX1(plot)} disabled={isRegistering} title="Register this charger on X1 EcoChain. Verifiable identity — trust with drivers.">{isRegistering ? '…' : 'Register on X1'}</button>
            <span className="peaq-register-hint">Verifiable identity → trust with drivers</span>
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
  const updateChargerPeaqDid = useWorldStore(s => s.updateChargerPeaqDid);
  const pushEvent = useWorldStore(s => s.pushEvent);

  const [error, setError] = useState('');
  const [x1Loading, setX1Loading] = useState(null);

  const handle = (fn) => async (plotId) => {
    setError('');
    try { await fn(plotId); }
    catch (e) { setError(e.message); pushEvent('error', e.message); }
  };

  const handleRegisterX1 = async (plot) => {
    if (!user || !plot.charger) return;
    setError('');
    setX1Loading(plot.id);
    try {
      const { didName, hash } = await registerChargerOnX1({
        chargerId: `charger-${plot.id}`,
        ownerAddress: user.pubkey,
        rate: plot.charger.ratePerSec,
        stake: plot.charger.staked ?? 100,
        landRef: plot.id,
      });
      updateChargerPeaqDid(plot.id, didName);
      pushEvent('peaq', `Registered on X1: ${didName}. Verifiable identity — service history builds trust with drivers.`);
    } catch (e) {
      setError(e.message);
      pushEvent('error', e.message);
    } finally {
      setX1Loading(null);
    }
  };

  const byRow = useMemo(() => {
    const r = Array.from({ length: rows }, () => []);
    grid.forEach(p => { r[p.row].push(p); });
    r.forEach(arr => arr.sort((a, b) => a.col - b.col));
    return r;
  }, [grid, rows]);

  return (
    <div>
      {error && <div className="error">{error}</div>}
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
            onRegisterX1={handleRegisterX1}
            isActive={!!sessions[plot.id]}
            x1Loading={x1Loading}
          />
        ))}
      </div>
      <div className="legend">
        <span className="badge owned">Owned</span>
        <span className="badge has-charger">Charger</span>
        <span className="badge active">Active</span>
        <span className="badge peaq">X1</span>
      </div>
    </div>
  );
}


