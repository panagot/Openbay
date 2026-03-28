import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import data from '../data/chargePointsSample.json';
import { useWorldStore } from '../state/store.js';
import { usePersona } from '../context/PersonaContext.jsx';
import { spawnRateFromNode } from '../utils/nodeHelpers.js';

const CATEGORY_ORDER = [
  'EV charging',
  'Energy & flex',
  'Micromobility',
  'Marina & RV',
  'Parking & loading',
  'Space & access',
  'Connectivity & edge',
  'Civic & community',
];

export function ChargePointsPanel() {
  const { persona } = usePersona();
  const { charge_points } = data;
  const grid = useWorldStore(s => s.grid);
  const mintLand = useWorldStore(s => s.mintLand);
  const deployCharger = useWorldStore(s => s.deployCharger);
  const linkChargePointToPlot = useWorldStore(s => s.linkChargePointToPlot);
  const pushEvent = useWorldStore(s => s.pushEvent);
  const user = useWorldStore(s => s.user);
  const balances = useWorldStore(s => s.balances);
  const [msg, setMsg] = useState('');

  const byCategory = useMemo(() => {
    const m = new Map();
    charge_points.forEach(cp => {
      const label = cp.category_label || 'Other';
      const arr = m.get(label) || [];
      arr.push(cp);
      m.set(label, arr);
    });
    const entries = Array.from(m.entries());
    entries.sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a[0]);
      const ib = CATEGORY_ORDER.indexOf(b[0]);
      if (ia === -1 && ib === -1) return a[0].localeCompare(b[0]);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    return entries;
  }, [charge_points]);

  const costPerSpawn = 50 + 100;

  const spawnFromPoint = async cp => {
    setMsg('');
    try {
      if (!user) throw new Error('Connect a wallet');
      const pts = balances[user.pubkey]?.points ?? 0;
      if (pts < costPerSpawn) throw new Error(`Need ${costPerSpawn} POINTS (mint+stake). Reset world or earn from sessions.`);
      const unowned = grid.filter(p => !p.owner);
      if (unowned.length === 0) throw new Error('No free plots available');
      const choice = unowned[Math.floor(Math.random() * unowned.length)];
      const rate = spawnRateFromNode(cp);
      mintLand(choice.id);
      deployCharger(choice.id, rate);
      const pkw = cp.connectors?.[0]?.power_kw || 3;
      linkChargePointToPlot(cp.code, choice.id, {
        powerKw: pkw,
        category: cp.category,
        category_label: cp.category_label,
        vertical: cp.vertical,
        name: cp.name,
      });
      pushEvent(
        'oracle',
        `Spawned ${cp.category_label}: ${cp.name} (${cp.code}) → plot ${choice.id} @ ${rate}/s`,
      );
      setMsg(`Spawned on ${choice.id}`);
    } catch (e) {
      setMsg(e.message);
      pushEvent('error', e.message);
    }
  };

  const loadDemoForJudges = () => {
    setMsg('');
    try {
      if (!user) throw new Error('Connect a wallet');
      const unowned = grid.filter(p => !p.owner);
      const seen = new Set();
      const picks = [];
      for (const cp of charge_points) {
        if (picks.length >= 3) break;
        const cat = cp.category || 'default';
        if (seen.has(cat)) continue;
        seen.add(cat);
        picks.push(cp);
      }
      if (unowned.length < picks.length) throw new Error('Not enough free plots. Reset world first.');
      const pts = balances[user.pubkey]?.points ?? 0;
      if (pts < picks.length * costPerSpawn) {
        throw new Error(`Need ${picks.length * costPerSpawn} POINTS for ${picks.length} diverse demos. Reset world for a fresh 500 or run sessions.`);
      }
      picks.forEach((cp, i) => {
        const plot = unowned[i];
        const rate = spawnRateFromNode(cp);
        const pkw = cp.connectors?.[0]?.power_kw || 3;
        mintLand(plot.id);
        deployCharger(plot.id, rate);
        linkChargePointToPlot(cp.code, plot.id, {
          powerKw: pkw,
          category: cp.category,
          category_label: cp.category_label,
          vertical: cp.vertical,
          name: cp.name,
        });
        pushEvent(
          'system',
          `Demo: ${cp.category_label} — ${cp.location.city} (${cp.code}) → plot ${plot.id}. Open Map to view.`,
        );
      });
      setMsg(`Loaded ${picks.length} nodes (one per vertical family). Switch to Map.`);
      pushEvent('system', 'Diverse demo loaded — EV, energy, micromobility, etc.');
    } catch (e) {
      setMsg(e.message);
      pushEvent('error', e.message);
    }
  };

  return (
    <div className="panel">
      <h3>Physical nodes (sample catalog)</h3>
      <p className="muted small" style={{ marginTop: 0, marginBottom: 10 }}>
        {charge_points.length} <strong>demo</strong> listings (Balkans, EU, US, Bengaluru sample). Production fleet data
        would match the same schema as <strong>GET /api/v1/stations</strong> after <strong>register + telemetry</strong>
        {persona === 'oem' ? (
          <>—see <strong>Hardware &amp; API onboarding</strong> above.</>
        ) : (
          <>
            —switch to <strong>OEM / integrator</strong> in the hero or open <Link to="/lab">API Lab</Link>.
          </>
        )}{' '}
        Same grid/session mechanics here; pricing units vary by vertical.
      </p>
      <div className="panel-actions" style={{ marginBottom: 12 }}>
        <button
          type="button"
          onClick={loadDemoForJudges}
          title="Spawns 3 nodes from different categories (needs ~450 POINTS + 3 free plots)"
        >
          Load 3-category demo
        </button>
      </div>
      {msg && <div className="error">{msg}</div>}
      <div className="list">
        {byCategory.map(([label, arr]) => (
          <div key={label} style={{ marginBottom: 14 }}>
            <div className="row" style={{ fontWeight: 700 }}>
              <div>{label}</div>
              <div>{arr.length} sites</div>
            </div>
            {arr.map(cp => (
              <div key={cp.code} className="row node-catalog-row">
                <div>
                  <div className="node-title">{cp.name}</div>
                  <div className="muted small">
                    {cp.code} · {cp.location.city} · {cp.status}
                  </div>
                  <div className="muted small node-vertical">{cp.vertical}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span className="muted small">{cp.connectors?.map(c => c.type).join(', ')}</span>
                  <button type="button" onClick={() => spawnFromPoint(cp)}>
                    Spawn virtual
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="muted" style={{ marginTop: 8 }}>
        Each spawn: mint 50 + stake 100 POINTS. Map links persist in this browser (vdw_state_v2).
      </div>
    </div>
  );
}
