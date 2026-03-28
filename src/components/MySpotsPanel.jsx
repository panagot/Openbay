import React, { useMemo, useState } from 'react';
import { useWorldStore } from '../state/store.js';

export function MySpotsPanel() {
  const user = useWorldStore(s => s.user);
  const grid = useWorldStore(s => s.grid);
  const reservations = useWorldStore(s => s.reservations);
  const setPlotListing = useWorldStore(s => s.setPlotListing);
  const clearPlotListing = useWorldStore(s => s.clearPlotListing);
  const removeCharger = useWorldStore(s => s.removeCharger);
  const releaseLand = useWorldStore(s => s.releaseLand);
  const cancelReservation = useWorldStore(s => s.cancelReservation);

  const [listingPlot, setListingPlot] = useState('');
  const [name, setName] = useState('');
  const [vertical, setVertical] = useState('');
  const [categoryLabel, setCategoryLabel] = useState('');
  const [powerKw, setPowerKw] = useState('7');
  const [managePlot, setManagePlot] = useState('');
  const [msg, setMsg] = useState('');
  const [msgIsErr, setMsgIsErr] = useState(false);

  const myChargedPlots = useMemo(() => {
    if (!user) return [];
    return grid.filter(p => p.owner === user.pubkey && p.charger);
  }, [grid, user]);

  const myEmptyPlots = useMemo(() => {
    if (!user) return [];
    return grid.filter(p => p.owner === user.pubkey && !p.charger);
  }, [grid, user]);

  const myHostedBookings = useMemo(() => {
    if (!user) return [];
    return Object.entries(reservations)
      .filter(([, r]) => r.hostPubkey === user.pubkey && r.untilMs > Date.now())
      .map(([plotId, r]) => ({ plotId, ...r }));
  }, [reservations, user]);

  const myGuestBookings = useMemo(() => {
    if (!user) return [];
    return Object.entries(reservations)
      .filter(([, r]) => r.bookerPubkey === user.pubkey && r.untilMs > Date.now())
      .map(([plotId, r]) => ({ plotId, ...r }));
  }, [reservations, user]);

  const run = (fn, ok = 'Done') => {
    setMsg('');
    setMsgIsErr(false);
    try {
      fn();
      setMsg(ok);
    } catch (e) {
      setMsg(e.message);
      setMsgIsErr(true);
    }
  };

  if (!user) return null;

  return (
    <div className="panel my-spots-panel">
      <h3>Register &amp; manage spots</h3>
      <p className="muted small my-spots-lead">
        Name your deployed nodes for the catalog + API export, remove hardware from a slot, release empty land, and manage
        bookings (demo POINTS).
      </p>

      <h4 className="my-spots-sub">List your spot (catalog + JSON)</h4>
      <p className="muted small">Applies to plots where you already deployed a node.</p>
      <div className="my-spots-form">
        <label className="my-spots-label">
          Plot
          <select value={listingPlot} onChange={e => setListingPlot(e.target.value)}>
            <option value="">Select…</option>
            {myChargedPlots.map(p => (
              <option key={p.id} value={p.id}>
                {p.id}
                {p.listing?.name ? ` — ${p.listing.name}` : ''}
              </option>
            ))}
          </select>
        </label>
        <label className="my-spots-label">
          Display name
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Home 22kW bay" />
        </label>
        <label className="my-spots-label">
          Vertical
          <input value={vertical} onChange={e => setVertical(e.target.value)} placeholder="e.g. EV DC + V2H" />
        </label>
        <label className="my-spots-label">
          Category label
          <input value={categoryLabel} onChange={e => setCategoryLabel(e.target.value)} placeholder="e.g. EV charging" />
        </label>
        <label className="my-spots-label">
          Power (kW)
          <input value={powerKw} onChange={e => setPowerKw(e.target.value)} type="number" min="0.5" step="0.5" />
        </label>
        <div className="my-spots-form-actions">
          <button
            type="button"
            disabled={!listingPlot}
            onClick={() =>
              run(
                () =>
                  setPlotListing(listingPlot, {
                    name,
                    vertical,
                    category_label: categoryLabel,
                    powerKw: Number(powerKw) || 3,
                  }),
                'Listing saved — visible in API export',
              )
            }
          >
            Save listing
          </button>
          <button
            type="button"
            className="secondary"
            disabled={!listingPlot}
            onClick={() => run(() => clearPlotListing(listingPlot), 'Listing text cleared')}
          >
            Clear listing only
          </button>
        </div>
      </div>

      <h4 className="my-spots-sub">Remove node or release land</h4>
      <p className="muted small">
        <strong>Remove node</strong> refunds ~70% stake and clears catalog links.{' '}
        <strong>Release land</strong> refunds 25 POINTS on empty plots you own; remove the node first.
      </p>
      <div className="my-spots-form">
        <label className="my-spots-label">
          Plot to manage
          <select value={managePlot} onChange={e => setManagePlot(e.target.value)}>
            <option value="">Select…</option>
            {myChargedPlots.map(p => (
              <option key={`m-${p.id}`} value={p.id}>
                {p.id} (has node)
              </option>
            ))}
            {myEmptyPlots.map(p => (
              <option key={`e-${p.id}`} value={p.id}>
                {p.id} (land only)
              </option>
            ))}
          </select>
        </label>
        <div className="my-spots-form-actions">
          <button
            type="button"
            className="secondary"
            disabled={!managePlot || !myChargedPlots.some(p => p.id === managePlot)}
            onClick={() => {
              if (!window.confirm(`Remove node on ${managePlot}?`)) return;
              run(() => removeCharger(managePlot), 'Node removed');
            }}
          >
            Remove node
          </button>
          <button
            type="button"
            className="secondary"
            disabled={!managePlot || !myEmptyPlots.some(p => p.id === managePlot)}
            onClick={() => {
              if (!window.confirm(`Release land ${managePlot}?`)) return;
              run(() => releaseLand(managePlot), 'Land released');
            }}
          >
            Release land
          </button>
        </div>
      </div>

      <h4 className="my-spots-sub">Bookings on your nodes</h4>
      {myHostedBookings.length === 0 ? (
        <p className="muted small">No active guest bookings.</p>
      ) : (
        <ul className="my-spots-booking-list">
          {myHostedBookings.map(b => (
            <li key={b.plotId}>
              <span>
                <strong>{b.plotId}</strong> until {new Date(b.untilMs).toLocaleString()} · {b.feePoints} pts
              </span>
              <button type="button" className="secondary tiny" onClick={() => run(() => cancelReservation(b.plotId), 'Cancelled')}>
                Cancel (refund guest)
              </button>
            </li>
          ))}
        </ul>
      )}

      <h4 className="my-spots-sub">Your bookings (as guest)</h4>
      {myGuestBookings.length === 0 ? (
        <p className="muted small">Book another host&apos;s node from the grid (Book 15/30/60).</p>
      ) : (
        <ul className="my-spots-booking-list">
          {myGuestBookings.map(b => (
            <li key={`g-${b.plotId}`}>
              <span>
                <strong>{b.plotId}</strong> until {new Date(b.untilMs).toLocaleString()}
              </span>
              <button type="button" className="secondary tiny" onClick={() => run(() => cancelReservation(b.plotId), 'Cancelled')}>
                Cancel booking
              </button>
            </li>
          ))}
        </ul>
      )}

      {msg && (
        <div className={msgIsErr ? 'error' : 'muted small'} style={{ marginTop: 10 }}>
          {msg}
        </div>
      )}
    </div>
  );
}
