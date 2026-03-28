import React, { useMemo, useState } from 'react';
import data from '../data/chargePointsSample.json';
import { useWorldStore } from '../state/store.js';
import { hasEnergyPricing, markerColorForCategory, sessionFiatHint } from '../utils/nodeHelpers.js';

const gridStyle = {
  position: 'absolute',
  inset: 0,
  backgroundImage:
    'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
  backgroundSize: '48px 48px, 48px 48px',
  opacity: 0.35,
  pointerEvents: 'none',
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
    _y: 1 - (p.location.latitude - minLat) / latSpan,
  }));
}

export function MockMapView() {
  const { charge_points } = data;
  const [selected, setSelected] = useState(null);
  const points = useMemo(() => normalize(charge_points), [charge_points]);
  const cpMap = useWorldStore(s => s.cpToPlot);
  const cpMeta = useWorldStore(s => s.cpMeta);
  const sessions = useWorldStore(s => s.sessions);
  const grid = useWorldStore(s => s.grid);
  const startSession = useWorldStore(s => s.startSession);
  const stopSession = useWorldStore(s => s.stopSession);

  return (
    <div className="panel workspace-panel map-workspace">
      <h3>Node map (mock)</h3>
      <div className="map-cta">
        <p className="muted">
          Markers are coloured by <strong>vertical</strong>. Add <code>VITE_GOOGLE_MAPS_API_KEY</code> for real tiles +
          heatmap.
        </p>
        <a
          href="https://console.cloud.google.com/apis/credentials"
          target="_blank"
          rel="noreferrer"
          className="secondary"
          style={{ display: 'inline-block', marginTop: 6 }}
        >
          Get a Google Maps API key →
        </a>
      </div>
      <div className="map-mock-surface">
        <div style={gridStyle} />
        {points.map(cp => {
          const fill = markerColorForCategory(cp.category);
          const stroke = cp.status === 'active' ? 'rgba(255,255,255,0.5)' : 'var(--border)';
          return (
            <button
              key={cp.code}
              type="button"
              title={`${cp.category_label} · ${cp.name} · ${cp.location.city}`}
              onClick={() => setSelected(cp)}
              style={{
                position: 'absolute',
                left: `calc(${(cp._x * 100).toFixed(2)}% - 6px)`,
                top: `calc(${(cp._y * 100).toFixed(2)}% - 6px)`,
                width: 12,
                height: 12,
                borderRadius: 12,
                border: `2px solid ${stroke}`,
                background: fill,
                boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
                padding: 0,
                cursor: 'pointer',
              }}
            />
          );
        })}
        {selected && (
          <div
            className="map-popup"
            style={{
              position: 'absolute',
              left: `calc(${(selected._x * 100).toFixed(2)}% + 10px)`,
              top: `calc(${(selected._y * 100).toFixed(2)}% - 10px)`,
              minWidth: 240,
              padding: '12px 14px',
              borderRadius: 12,
            }}
          >
            <div className="map-popup-cat">{selected.category_label}</div>
            <div style={{ fontWeight: 700 }}>{selected.name}</div>
            <div className="muted small">{selected.vertical}</div>
            <div className="muted">
              {selected.code} · {selected.status}
            </div>
            <div className="muted">{selected.location.address}</div>
            <div style={{ marginTop: 6 }} className="small">
              <div>Slots / connectors: {selected.no_of_connectors}</div>
              {hasEnergyPricing(selected) ? (
                <div>
                  Energy: {selected.pricing.energy_based.rate} {selected.pricing.energy_based.unit}
                </div>
              ) : (
                <div>Energy: — (time / access priced)</div>
              )}
              <div>
                Time: {selected.pricing.time_based.rate} {selected.pricing.time_based.unit}
              </div>
            </div>
            {(() => {
              const plotId = cpMap[selected.code];
              const active = plotId && sessions[plotId];
              const plot = grid.find(p => p.id === plotId);
              const powerKw = cpMeta[selected.code]?.powerKw || selected.connectors?.[0]?.power_kw || 3;
              const rate = plot?.charger?.ratePerSec || Math.max(1, Math.round(powerKw * 0.5));
              const startTs = active?.startTs || null;
              const secs = startTs ? Math.floor((Date.now() - startTs) / 1000) : 0;
              const costPts = secs * rate;
              const hint = sessionFiatHint(selected, secs, powerKw);
              return (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed var(--border)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    <div className="stat">
                      <div className="label">Rate</div>
                      <div className="value">{rate}/s</div>
                    </div>
                    <div className="stat">
                      <div className="label">Time</div>
                      <div className="value">{secs}s</div>
                    </div>
                    <div className="stat">
                      <div className="label">POINTS</div>
                      <div className="value">{costPts}</div>
                    </div>
                  </div>
                  <div className="muted small" style={{ marginTop: 6 }}>
                    {hint}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {!active && plotId && (
                      <button type="button" onClick={() => startSession(plotId)}>
                        Start session
                      </button>
                    )}
                    {active && (
                      <button type="button" className="secondary" onClick={() => stopSession(plotId)}>
                        Stop
                      </button>
                    )}
                    {!plotId && <span className="muted">Spawn from catalog to link.</span>}
                  </div>
                </div>
              );
            })()}
            <div style={{ marginTop: 6 }}>
              <button type="button" className="secondary" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="muted" style={{ marginTop: 8 }}>
        Normalized lat/lon. Colours: mint=EV, amber=energy, blue=micromobility, etc.
      </div>
    </div>
  );
}
