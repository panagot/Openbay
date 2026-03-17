import React, { useMemo } from 'react';
import { useWorldStore } from '../state/store.js';

export function Leaderboard() {
  const balances = useWorldStore(s => s.balances);
  const grid = useWorldStore(s => s.grid);

  const owners = useMemo(() => {
    const yieldByOwner = new Map();
    Object.entries(balances).forEach(([pk, bal]) => {
      yieldByOwner.set(pk, bal.earned || 0);
    });
    const named = Array.from(yieldByOwner.entries()).map(([pk, earned]) => ({ pk, earned }));
    named.sort((a, b) => b.earned - a.earned);
    return named.slice(0, 5);
  }, [balances]);

  const plotsByOwner = useMemo(() => {
    const m = new Map();
    grid.forEach(p => { if (p.owner) m.set(p.owner, (m.get(p.owner) || 0) + 1); });
    return m;
  }, [grid]);

  return (
    <div className="panel">
      <h3>Leaderboards</h3>
      <div className="list">
        {owners.length === 0 && <div className="muted">No earnings yet.</div>}
        {owners.map((o, i) => (
          <div key={o.pk} className="row">
            <div>#{i + 1} {o.pk.slice(0, 4)}…{o.pk.slice(-4)} ({plotsByOwner.get(o.pk) || 0} plots)</div>
            <div>{o.earned} earned</div>
          </div>
        ))}
      </div>
    </div>
  );
}


