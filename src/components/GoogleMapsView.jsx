import React, { useMemo, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, HeatmapLayer } from '@react-google-maps/api';
import data from '../data/chargePointsSample.json';
import { MockMapView } from './MockMapView.jsx';
import { useWorldStore } from '../state/store.js';

const containerStyle = { width: '100%', height: '520px', borderRadius: '10px', overflow: 'hidden' };

export function GoogleMapsView() {
  const { charge_points } = data;
  const cpMap = useWorldStore(s => s.cpToPlot);
  const sessions = useWorldStore(s => s.sessions);
  const grid = useWorldStore(s => s.grid);
  const cpMeta = useWorldStore(s => s.cpMeta);
  const startSession = useWorldStore(s => s.startSession);
  const stopSession = useWorldStore(s => s.stopSession);
  const defaultCenter = useMemo(() => ({ lat: 38.9072, lng: -77.0369 }), []);
  const [center, setCenter] = useState(defaultCenter);
  const [filters, setFilters] = useState(() => {
    try {
      const raw = localStorage.getItem('vdw_map_filters');
      return raw ? JSON.parse(raw) : { activeOnly: false, dcOnly: false, minKw: 0 };
    } catch { return { activeOnly: false, dcOnly: false, minKw: 0 }; }
  });
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);
  const [selected, setSelected] = useState(null);

  React.useEffect(() => { try { localStorage.setItem('vdw_map_filters', JSON.stringify(filters)); } catch {} }, [filters]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return <MockMapView />;
  }

  if (scriptError) {
    return (
      <div className="panel">
        <h3>Charge Points Map</h3>
        <div className="error" style={{ marginTop: 8 }}>Map failed to load. Check your API key and enable Maps JavaScript API in Google Cloud.</div>
        <button className="secondary" style={{ marginTop: 12 }} onClick={() => setScriptError(false)}>Retry</button>
        <div style={{ marginTop: 16 }}><MockMapView /></div>
      </div>
    );
  }

  const heatmapData = scriptLoaded && typeof window !== 'undefined' && window.google?.maps?.LatLng
    ? charge_points.map(cp => ({
        location: new window.google.maps.LatLng(cp.location.latitude, cp.location.longitude),
        weight: (cp.connectors?.[0]?.power_kw || 3) * (sessions[cpMap[cp.code]] ? 1.6 : 1.0)
      }))
    : [];

  return (
    <div className="panel">
      <h3>Charge Points Map</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <span className="muted">Quick center:</span>
        {/* Using a key on GoogleMap below to force re-center when we change coordinates */}
        <button id="center-wdc" onClick={() => setCenter({ lat: 38.9072, lng: -77.0369 })}>Washington, D.C.</button>
        <button className="secondary" onClick={() => setCenter({ lat: 47.6062, lng: -122.3321 })}>Seattle, WA</button>
        <button className="secondary" onClick={() => setCenter(defaultCenter)}>Reset</button>
        <div style={{ flex: 1 }} />
        <label className="muted" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={filters.activeOnly} onChange={e => setFilters({ ...filters, activeOnly: e.target.checked })} /> Active only
        </label>
        <label className="muted" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input type="checkbox" checked={filters.dcOnly} onChange={e => setFilters({ ...filters, dcOnly: e.target.checked })} /> DC only
        </label>
        <label className="muted" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          Min kW
          <input type="number" value={filters.minKw} min={0} step={1} style={{ width: 70, background: '#f5f5f7', color: '#1d1d1f', border: '1px solid #d2d2d7', borderRadius: 8, padding: '6px 8px' }} onChange={e => setFilters({ ...filters, minKw: Number(e.target.value || 0) })} />
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
            zoom={7}
            options={{ disableDefaultUI: false, styles: undefined }}
          >
            {heatmapData.length > 0 && (
              <HeatmapLayer data={heatmapData} options={{ radius: 24, dissipating: true }} />
            )}
            {charge_points
              .filter(cp => (!filters.activeOnly || cp.status === 'active'))
              .filter(cp => (!filters.dcOnly || (cp.connectors?.some(c => String(c.type).toLowerCase().includes('dc')))))
              .filter(cp => ((cp.connectors?.[0]?.power_kw || 0) >= filters.minKw))
              .map((cp) => (
              <Marker
                key={cp.code}
                position={{ lat: cp.location.latitude, lng: cp.location.longitude }}
                label={cp.no_of_connectors?.toString?.() || '1'}
                onClick={() => setSelected(cp)}
              />
            ))}
            {selected && (
              <InfoWindow
                position={{ lat: selected.location.latitude, lng: selected.location.longitude }}
                onCloseClick={() => setSelected(null)}
              >
                <div style={{ maxWidth: 260 }}>
                  <div style={{ fontWeight: 700 }}>{selected.name}</div>
                  <div className="muted">{selected.code} • {selected.status}</div>
                  <div className="muted">{selected.location.address}</div>
                  <div style={{ marginTop: 6 }}>
                    <div>Connectors: {selected.no_of_connectors}</div>
                    <div>Energy: {selected.pricing.energy_based.rate} {selected.pricing.energy_based.unit}</div>
                    <div>Time: {selected.pricing.time_based.rate} {selected.pricing.time_based.unit}</div>
                  </div>
                  {/* Live session card */}
                  {(() => {
                    const plotId = cpMap[selected.code];
                    const active = plotId && sessions[plotId];
                    const plot = grid.find(p => p.id === plotId);
                    const powerKw = cpMeta[selected.code]?.powerKw || (selected.connectors?.[0]?.power_kw || 3);
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
                        {active && (
                          <div style={{ marginTop: 6 }}>
                            <a
                              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Charging at ${selected.name} • ${kwh} kWh • ${costPts} POINTS • #DePIN #WorldMobileChain @wmchain`)}`}
                              target="_blank" rel="noreferrer"
                            >Share to X</a>
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
      <div className="muted" style={{ marginTop: 8 }}>Sample charge points. Map for visualization only. Powered by Google Maps · Built for World Mobile Chain.</div>
    </div>
  );
}


