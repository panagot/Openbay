import React, { useMemo, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, HeatmapLayer } from '@react-google-maps/api';
import data from '../data/chargePointsSample.json';
import { MockMapView } from './MockMapView.jsx';
import { useWorldStore } from '../state/store.js';
import { hasEnergyPricing, markerColorForCategory, sessionFiatHint } from '../utils/nodeHelpers.js';

const containerStyle = { width: '100%', height: '520px', borderRadius: '10px', overflow: 'hidden' };

function defaultFilters() {
  return { activeOnly: false, dcOnly: false, minKw: 0, category: 'all' };
}

export function GoogleMapsView() {
  const { charge_points } = data;
  const cpMap = useWorldStore(s => s.cpToPlot);
  const sessions = useWorldStore(s => s.sessions);
  const grid = useWorldStore(s => s.grid);
  const cpMeta = useWorldStore(s => s.cpMeta);
  const startSession = useWorldStore(s => s.startSession);
  const stopSession = useWorldStore(s => s.stopSession);
  const defaultCenter = useMemo(() => ({ lat: 46.0, lng: 14.5 }), []);
  const [center, setCenter] = useState(defaultCenter);
  const [filters, setFilters] = useState(() => {
    try {
      const raw = localStorage.getItem('vdw_map_filters');
      const parsed = raw ? JSON.parse(raw) : {};
      return { ...defaultFilters(), ...parsed };
    } catch {
      return defaultFilters();
    }
  });
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [selected, setSelected] = useState(null);

  const categoryOptions = useMemo(() => {
    const labels = [...new Set(charge_points.map(c => c.category_label).filter(Boolean))];
    labels.sort();
    return labels;
  }, [charge_points]);

  const filteredPoints = useMemo(
    () =>
      charge_points
        .filter(cp => !filters.activeOnly || cp.status === 'active')
        .filter(
          cp => !filters.dcOnly || cp.connectors?.some(c => String(c.type).toLowerCase().includes('dc')),
        )
        .filter(cp => (cp.connectors?.[0]?.power_kw || 0) >= filters.minKw)
        .filter(cp => filters.category === 'all' || cp.category_label === filters.category),
    [charge_points, filters],
  );

  React.useEffect(() => {
    try {
      localStorage.setItem('vdw_map_filters', JSON.stringify(filters));
    } catch {}
  }, [filters]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return <MockMapView />;
  }

  if (scriptError) {
    return (
      <div className="panel workspace-panel map-workspace">
        <h3>Node map</h3>
        <div className="error" style={{ marginTop: 8 }}>
          Map failed to load. Check your API key and enable Maps JavaScript API in Google Cloud.
        </div>
        <button type="button" className="secondary" style={{ marginTop: 12 }} onClick={() => setScriptError(false)}>
          Retry
        </button>
        <div style={{ marginTop: 16 }}>
          <MockMapView />
        </div>
      </div>
    );
  }

  const heatmapData =
    scriptLoaded && typeof window !== 'undefined' && window.google?.maps?.LatLng
      ? filteredPoints.map(cp => ({
          location: new window.google.maps.LatLng(cp.location.latitude, cp.location.longitude),
          weight: (cp.connectors?.[0]?.power_kw || 3) * (sessions[cpMap[cp.code]] ? 1.6 : 1.0),
        }))
      : [];

  return (
    <div className="panel workspace-panel map-workspace">
      <h3>Node map (Google)</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span className="muted">Center:</span>
        <button type="button" onClick={() => setCenter({ lat: 44.8, lng: 20.4 })}>
          Balkans
        </button>
        <button type="button" className="secondary" onClick={() => setCenter({ lat: 52.52, lng: 13.405 })}>
          Berlin
        </button>
        <button type="button" className="secondary" onClick={() => setCenter({ lat: 38.9072, lng: -77.0369 })}>
          Washington DC
        </button>
        <button type="button" className="secondary" onClick={() => setCenter(defaultCenter)}>
          Reset
        </button>
        <div style={{ flex: '1 1 120px' }} />
        <label className="muted" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={filters.activeOnly}
            onChange={e => setFilters({ ...filters, activeOnly: e.target.checked })}
          />{' '}
          Active only
        </label>
        <label className="muted" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={filters.dcOnly}
            onChange={e => setFilters({ ...filters, dcOnly: e.target.checked })}
          />{' '}
          EV DC only
        </label>
        <label className="muted" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          Min kW
          <input
            type="number"
            value={filters.minKw}
            min={0}
            step={1}
            style={{
              width: 70,
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '6px 8px',
            }}
            onChange={e => setFilters({ ...filters, minKw: Number(e.target.value || 0) })}
          />
        </label>
        <label className="muted" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          Vertical
          <select
            value={filters.category}
            style={{
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '6px 8px',
            }}
            onChange={e => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="all">All</option>
            {categoryOptions.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>
      <LoadScript
        googleMapsApiKey={apiKey}
        libraries={['visualization']}
        onLoad={() => setScriptLoaded(true)}
        onError={() => setScriptError(true)}
        loadingElement={<div className="map-loading">Loading map…</div>}
      >
        {scriptLoaded ? (
          <GoogleMap
            key={`${center.lat},${center.lng}`}
            mapContainerStyle={containerStyle}
            center={center}
            zoom={4}
            options={{ disableDefaultUI: false, styles: undefined }}
          >
            {heatmapData.length > 0 && (
              <HeatmapLayer data={heatmapData} options={{ radius: 24, dissipating: true }} />
            )}
            {filteredPoints.map(cp => {
              const g = window.google?.maps;
              const icon =
                g?.SymbolPath != null
                  ? {
                      path: g.SymbolPath.CIRCLE,
                      fillColor: markerColorForCategory(cp.category),
                      fillOpacity: 1,
                      strokeColor: 'rgba(255,255,255,0.85)',
                      strokeWeight: 1,
                      scale: 8,
                    }
                  : undefined;
              return (
                <Marker
                  key={cp.code}
                  position={{ lat: cp.location.latitude, lng: cp.location.longitude }}
                  label={cp.no_of_connectors?.toString?.() || '1'}
                  icon={icon}
                  onClick={() => setSelected(cp)}
                />
              );
            })}
            {selected && (
              <InfoWindow
                position={{ lat: selected.location.latitude, lng: selected.location.longitude }}
                onCloseClick={() => setSelected(null)}
              >
                <div style={{ maxWidth: 280 }}>
                  <div className="map-popup-cat">{selected.category_label}</div>
                  <div style={{ fontWeight: 700 }}>{selected.name}</div>
                  <div className="muted small">{selected.vertical}</div>
                  <div className="muted">
                    {selected.code} · {selected.status}
                  </div>
                  <div className="muted">{selected.location.address}</div>
                  <div style={{ marginTop: 6 }} className="small">
                    <div>Slots: {selected.no_of_connectors}</div>
                    {hasEnergyPricing(selected) ? (
                      <div>
                        Energy: {selected.pricing.energy_based.rate} {selected.pricing.energy_based.unit}
                      </div>
                    ) : (
                      <div>Energy: —</div>
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
                    const kwh = ((powerKw * secs) / 3600).toFixed(3);
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
                        {active && (
                          <div style={{ marginTop: 6 }}>
                            <a
                              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                                `Session at ${selected.name} · ${kwh} kWh-eq · ${costPts} POINTS · #DePIN #Solana #OpenBay`,
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Share to X
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        ) : null}
      </LoadScript>
      <div className="muted" style={{ marginTop: 8 }}>
        {filteredPoints.length} nodes match filters. OpenBay catalog.
      </div>
    </div>
  );
}
