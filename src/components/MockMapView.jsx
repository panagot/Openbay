import React, { useMemo, useState } from 'react';
import data from '../data/chargePointsSample.json';
import { useWorldStore } from '../state/store.js';

// Simple mock map that lays out markers using a normalized lat/lon projection.
// Add VITE_GOOGLE_MAPS_API_KEY to .env for the full Google Maps view (heatmap, real tiles).

const containerStyle = {
  width: '100%',
  height: '520px',
  borderRadius: '12px',
  overflow: 'hidden',
  position: 'relative',
  background: 'linear-gradient(180deg, #e8e8ed 0%, #f5f5f7 50%, #ffffff 100%)',
  border: '1px solid #d2d2d7',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
};

const gridStyle = {
  position: 'absolute',
  inset: 0,
  backgroundImage:
    'linear-gradient(#d2d2d7 1px, transparent 1px), linear-gradient(90deg, #d2d2d7 1px, transparent 1px)',
  backgroundSize: '48px 48px, 48px 48px',
  opacity: 0.4,
  pointerEvents: 'none'
};

function normalize(points) {
  const lats = points.map(p => p.location.latitude);
  const lons = points.map(p => p.location.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const latSpan = Math.max(0.0001, maxLat - minLat);
  const lonSpan = Math.max(0.0001, maxLon - minLon);
  return points.map(p => ({
    ...p,
    _x: (p.location.longitude - minLon) / lonSpan,
    _y: 1 - (p.location.latitude - minLat) / latSpan
  }));
}

export function MockMapView() {
  const { charge_points } = data;
  const [selected, setSelected] = useState(null);
  const points = useMemo(() => normalize(charge_points), [charge_points]);
  const cpMap = useWorldStore(s => s.cpToPlot);
  const sessions = useWorldStore(s => s.sessions);
  const grid = useWorldStore(s => s.grid);
  const startSession = useWorldStore(s => s.startSession);
  const stopSession = useWorldStore(s => s.stopSession);

  return (
    <div className="panel">
      <h3>Charge Points Map</h3>
      <div className="map-cta">
        <p className="muted">
          Using built-in mock map. For the full experience with Google Maps (satellite/traffic, heatmap), add{' '}
          <code>VITE_GOOGLE_MAPS_API_KEY</code> to a <code>.env</code> file in the project root.
        </p>
        <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="secondary" style={{ display: 'inline-block', marginTop: 6 }}>
          Get a Google Maps API key →
        </a>
      </div>
      <div style={containerStyle}>
        <div style={gridStyle} />
        {points.map(cp => (
          <button
            key={cp.code}
            title={`${cp.name} • ${cp.location.city}`}
            onClick={() => setSelected(cp)}
            style={{
              position: 'absolute',
              left: `calc(${(cp._x * 100).toFixed(2)}% - 6px)`,
              top: `calc(${(cp._y * 100).toFixed(2)}% - 6px)`,
              width: 12,
              height: 12,
              borderRadius: 12,
              border: '1px solid #d2d2d7',
              background: cp.status === 'active' ? '#34c759' : cp.status === 'maintenance' ? '#ff9f0a' : '#ff3b30',
              boxShadow: '0 1px 4px rgba(0,0,0,0.12)'
            }}
          />
        ))}
        {selected && (
          <div
            className="map-popup"
            style={{
              position: 'absolute',
              left: `calc(${(selected._x * 100).toFixed(2)}% + 10px)`,
              top: `calc(${(selected._y * 100).toFixed(2)}% - 10px)`,
              minWidth: 220,
              padding: '12px 14px',
              borderRadius: 12
            }}
          >
            <div style={{ fontWeight: 700 }}>{selected.name}</div>
            <div className="muted">{selected.code} • {selected.status}</div>
            <div className="muted">{selected.location.address}</div>
            <div style={{ marginTop: 6 }}>
              <div>Connectors: {selected.no_of_connectors}</div>
              <div>Energy: {selected.pricing.energy_based.rate} {selected.pricing.energy_based.unit}</div>
              <div>Time: {selected.pricing.time_based.rate} {selected.pricing.time_based.unit}</div>
            </div>
            {(() => {
              const plotId = cpMap[selected.code];
              const active = plotId && sessions[plotId];
              const plot = grid.find(p => p.id === plotId);
              const powerKw = selected.connectors?.[0]?.power_kw || 3;
              const rate = plot?.charger?.ratePerSec || Math.max(1, Math.round(powerKw * 0.5));
              const startTs = active?.startTs || null;
              const secs = startTs ? Math.floor((Date.now() - startTs) / 1000) : 0;
              const costPts = secs * rate;
              const kwh = ((powerKw * secs) / 3600).toFixed(3);
              const inrPerKwh = selected.pricing.energy_based.rate;
              const inrPerMin = selected.pricing.time_based.rate;
              const inrEnergy = (Number(kwh) * inrPerKwh).toFixed(2);
              const inrTime = ((secs / 60) * inrPerMin).toFixed(2);
              return (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed #d2d2d7' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    <div className="stat"><div className="label">Rate</div><div className="value">{rate}/s</div></div>
                    <div className="stat"><div className="label">Time</div><div className="value">{secs}s</div></div>
                    <div className="stat"><div className="label">Cost</div><div className="value">{costPts}</div></div>
                  </div>
                  <div className="muted" style={{ marginTop: 6 }}>≈ {kwh} kWh • ₹{inrEnergy} (kWh) • ₹{inrTime} (min)</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {!active && plotId && <button onClick={() => startSession(plotId)}>Start Session</button>}
                    {active && <button className="secondary" onClick={() => stopSession(plotId)}>Stop</button>}
                    {!plotId && <span className="muted">Spawn from panel to link this site.</span>}
                  </div>
                </div>
              );
            })()}
            <div style={{ marginTop: 6 }}>
              <button className="secondary" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
      <div className="muted" style={{ marginTop: 8 }}>Mock map uses normalized lat/lon. No API key required.</div>
    </div>
  );
}
