import React, { useMemo } from 'react';
import { useWorldStore } from '../state/store.js';

export function ChargerPanel() {
  const grid = useWorldStore(s => s.grid);
  const sessions = useWorldStore(s => s.sessions);
  const balances = useWorldStore(s => s.balances);
  const user = useWorldStore(s => s.user);

  const myPlots = useMemo(() => {
    if (!user) return [];
    return grid.filter(p => p.owner === user.pubkey);
  }, [grid, user]);

  const myBal = useMemo(() => {
    if (!user) return { points: 0, earned: 0, spent: 0 };
    return balances[user.pubkey] || { points: 0, earned: 0, spent: 0 };
  }, [balances, user]);

  const activeCount = Object.values(sessions).length;

  return (
    <div className="panel">
      <h3>Your Holdings</h3>
      <div className="panel-actions">
        <button className="secondary" onClick={() => { localStorage.clear(); location.reload(); }}>Reset World</button>
        <a className="secondary" href="https://x1.eco" target="_blank" rel="noreferrer">X1 EcoChain</a>
        <a className="secondary" href="https://x.com/X1_EcoChain" target="_blank" rel="noreferrer">X1 X</a>
      </div>
      <div className="stats">
        <div className="stat"><div className="label">POINTS</div><div className="value">{myBal.points}</div></div>
        <div className="stat"><div className="label">Earned</div><div className="value">{myBal.earned}</div></div>
        <div className="stat"><div className="label">Spent</div><div className="value">{myBal.spent}</div></div>
        <div className="stat"><div className="label">Active Sessions</div><div className="value">{activeCount}</div></div>
      </div>

      <h4>Your Plots</h4>
      <div className="list">
        {myPlots.length === 0 && <div className="muted">No plots yet. Mint from the grid.</div>}
        {myPlots.map(p => (
          <div key={p.id} className="row">
            <div>Plot {p.id} {p.charger?.peaqDid && <span className="peaq-badge">X1</span>}</div>
            <div>{p.charger ? `⚡ ${p.charger.ratePerSec}/s` : 'No charger'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
