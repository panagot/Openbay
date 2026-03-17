import React, { useMemo } from 'react';
import data from '../data/chargePointsSample.json';
import { useWorldStore } from '../state/store.js';

export function StatsHeader() {
  const { charge_points } = data;
  const sessions = useWorldStore(s => s.sessions);
  const cities = useMemo(() => new Set(charge_points.map(c => c.location.city)), [charge_points]);
  const totalKw = useMemo(() => charge_points.reduce((acc, cp) => acc + (cp.connectors?.[0]?.power_kw || 0), 0), [charge_points]);
  const activeSites = useMemo(() => charge_points.filter(cp => cp.status === 'active').length, [charge_points]);
  const activeSess = Object.keys(sessions).length;

  return (
    <div className="stats-header">
      <div className="sh-grid">
        <div className="sh-item">
          <div className="value">{charge_points.length}</div>
          <div className="label">Sites</div>
        </div>
        <div className="sh-item">
          <div className="value">{activeSites}</div>
          <div className="label">Active Sites</div>
        </div>
        <div className="sh-item">
          <div className="value">{cities.size}</div>
          <div className="label">Cities</div>
        </div>
        <div className="sh-item">
          <div className="value">{totalKw}</div>
          <div className="label">kW Listed</div>
        </div>
        <div className={`sh-item ${activeSess > 0 ? 'highlight' : ''}`}>
          <div className="value">{activeSess}</div>
          <div className="label">Active Sessions</div>
        </div>
      </div>
    </div>
  );
}


