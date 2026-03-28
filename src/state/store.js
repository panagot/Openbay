import { create } from 'zustand';
import { nanoid } from 'nanoid';

const GRID_ROWS = 8;
const GRID_COLS = 12;

const initialPlots = () => {
  const arr = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      arr.push({ id: `${r}-${c}`, row: r, col: c, owner: null, charger: null });
    }
  }
  return arr;
};

const persistKey = 'vdw_state_v2';

function migrateGridChargers(grid) {
  if (!Array.isArray(grid)) return grid;
  return grid.map((p) => {
    if (!p?.charger) return p;
    const c = { ...p.charger };
    if (c.peaqDid != null && c.solanaAnchor == null) {
      c.solanaAnchor = c.peaqDid;
      delete c.peaqDid;
    }
    return { ...p, charger: c };
  });
}

function loadState() {
  try {
    let raw = localStorage.getItem(persistKey);
    if (!raw) {
      raw = localStorage.getItem('vdw_state_v1');
      if (raw) {
        const legacy = JSON.parse(raw);
        const migrated = { ...legacy, grid: migrateGridChargers(legacy.grid) };
        localStorage.setItem(persistKey, JSON.stringify(migrated));
      }
    }
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.grid) data.grid = migrateGridChargers(data.grid);
    if (!data.cpToPlot) data.cpToPlot = {};
    if (!data.cpMeta) data.cpMeta = {};
    if (!data.reservations) data.reservations = {};
    return data;
  } catch (e) {
    return null;
  }
}

function saveState(partial) {
  try {
    localStorage.setItem(persistKey, JSON.stringify(partial));
  } catch (e) {}
}

export const useWorldStore = create((set, get) => ({
  grid: initialPlots(),
  rows: GRID_ROWS,
  cols: GRID_COLS,
  user: null, // { pubkey, label, walletKind?: 'local'|'evm'|'solana' }
  balances: {}, // pubkey -> { points: number, earned: number, spent: number }
  sessions: {}, // plotId -> { driver, startTs, ratePerSec }
  cpToPlot: {}, // charge point code -> plotId
  cpMeta: {}, // charge point code -> { powerKw, category?, vertical?, name?, category_label? }
  /** plotId -> { bookerPubkey, untilMs, feePoints } — demo booking / hold */
  reservations: {},
  events: [],

  initFromStorage: () => {
    const snap = loadState();
    if (!snap) return;
    if (!snap.reservations) snap.reservations = {};
    set(snap);
  },

  persist: () => {
    const s = get();
    saveState({
      grid: s.grid,
      rows: s.rows,
      cols: s.cols,
      user: s.user,
      balances: s.balances,
      sessions: s.sessions,
      events: s.events,
      cpToPlot: s.cpToPlot,
      cpMeta: s.cpMeta,
      reservations: s.reservations,
    });
  },

  ensureUser: (user) => {
    set({ user });
    const balances = { ...get().balances };
    if (!balances[user.pubkey]) {
      balances[user.pubkey] = { points: 500, earned: 0, spent: 0 };
      set({ balances });
      get().pushEvent('system', `Welcome ${user.label}. You received 500 POINTS to get started.`);
    }
    get().persist();
  },

  pushEvent: (kind, text) => {
    const ev = { id: nanoid(), ts: Date.now(), kind, text };
    set({ events: [ev, ...get().events].slice(0, 200) });
  },

  mintLand: (plotId) => {
    const { user, grid, balances } = get();
    if (!user) throw new Error('Connect a wallet');
    const idx = grid.findIndex(p => p.id === plotId);
    if (idx === -1) return;
    if (grid[idx].owner) throw new Error('Already owned');
    const price = 50;
    if ((balances[user.pubkey]?.points || 0) < price) throw new Error('Not enough points');
    const newGrid = grid.slice();
    newGrid[idx] = { ...newGrid[idx], owner: user.pubkey };
    const newBalances = { ...balances };
    newBalances[user.pubkey].points -= price;
    newBalances[user.pubkey].spent += price;
    set({ grid: newGrid, balances: newBalances });
    get().pushEvent('land', `${user.label} minted land ${plotId} for ${price} POINTS`);
    get().persist();
  },

  deployCharger: (plotId, ratePerSec = 2) => {
    const { user, grid, balances } = get();
    if (!user) throw new Error('Connect a wallet');
    const idx = grid.findIndex(p => p.id === plotId);
    if (idx === -1) return;
    const plot = grid[idx];
    if (plot.owner !== user.pubkey) throw new Error('You do not own this plot');
    if (plot.charger) throw new Error('Charger already deployed');
    const stake = 100;
    if ((balances[user.pubkey]?.points || 0) < stake) throw new Error('Not enough points to stake');
    const newGrid = grid.slice();
    newGrid[idx] = { ...plot, charger: { ratePerSec, staked: stake, owner: user.pubkey, solanaAnchor: null } };
    const newBalances = { ...balances };
    newBalances[user.pubkey].points -= stake;
    newBalances[user.pubkey].spent += stake;
    set({ grid: newGrid, balances: newBalances });
    get().pushEvent('charger', `${user.label} deployed a node on ${plotId} (rate ${ratePerSec}/s)`);
    get().persist();
  },

  updateChargerSolanaAnchor: (plotId, stationId, sigPreview) => {
    const { grid } = get();
    const idx = grid.findIndex(p => p.id === plotId);
    if (idx === -1 || !grid[idx].charger) return;
    const newGrid = grid.slice();
    newGrid[idx] = {
      ...newGrid[idx],
      charger: { ...newGrid[idx].charger, solanaAnchor: stationId },
    };
    set({ grid: newGrid });
    get().pushEvent(
      'solana',
      `Station ${plotId} anchored (Solana): ${stationId} · sig ${sigPreview}`,
    );
    get().persist();
  },

  /** Public catalog fields for grant demo (owner-editable) */
  setPlotListing: (plotId, listing) => {
    const { user, grid } = get();
    if (!user) throw new Error('Connect a wallet');
    const idx = grid.findIndex(p => p.id === plotId);
    if (idx === -1) throw new Error('Plot not found');
    const plot = grid[idx];
    if (plot.owner !== user.pubkey) throw new Error('You do not own this plot');
    if (!plot.charger) throw new Error('Deploy a node first, then set listing details');
    const name = String(listing?.name || '').trim() || `Spot ${plotId}`;
    const vertical = String(listing?.vertical || '').trim() || 'Host-listed';
    const category_label = String(listing?.category_label || '').trim() || 'Custom host';
    const powerKw = Math.max(0.5, Number(listing?.powerKw) || 3);
    const newGrid = grid.slice();
    newGrid[idx] = {
      ...plot,
      listing: { name, vertical, category_label, powerKw, updatedAt: Date.now() },
    };
    set({ grid: newGrid });
    get().pushEvent('system', `Listed “${name}” on ${plotId} for discovery / API export`);
    get().persist();
  },

  clearPlotListing: plotId => {
    const { user, grid } = get();
    if (!user) throw new Error('Connect a wallet');
    const idx = grid.findIndex(p => p.id === plotId);
    if (idx === -1) return;
    const plot = grid[idx];
    if (plot.owner !== user.pubkey) throw new Error('You do not own this plot');
    const newGrid = grid.slice();
    newGrid[idx] = { ...plot, listing: null };
    set({ grid: newGrid });
    get().pushEvent('system', `Removed listing text from ${plotId}`);
    get().persist();
  },

  /** Undeploy node: refunds 70% of stake; clears catalog links to this plot */
  removeCharger: plotId => {
    const { user, grid, balances, sessions, cpToPlot } = get();
    if (!user) throw new Error('Connect a wallet');
    if (sessions[plotId]) throw new Error('Stop the active session first');
    const idx = grid.findIndex(p => p.id === plotId);
    if (idx === -1) return;
    const plot = grid[idx];
    if (plot.owner !== user.pubkey) throw new Error('You do not own this plot');
    if (!plot.charger) throw new Error('No node deployed here');
    const stake = plot.charger.staked || 100;
    const refund = Math.floor(stake * 0.7);
    const newGrid = grid.slice();
    newGrid[idx] = { ...plot, charger: null, listing: null };
    const newBalances = { ...balances };
    const ob = { ...(newBalances[user.pubkey] || { points: 0, earned: 0, spent: 0 }) };
    ob.points += refund;
    ob.earned += refund;
    newBalances[user.pubkey] = ob;
    const mapping = { ...cpToPlot };
    Object.keys(mapping).forEach(code => {
      if (mapping[code] === plotId) delete mapping[code];
    });
    const nextMeta = { ...get().cpMeta };
    Object.keys(cpToPlot).forEach(code => {
      if (cpToPlot[code] === plotId) delete nextMeta[code];
    });
    const reservations = { ...get().reservations };
    delete reservations[plotId];
    set({ grid: newGrid, balances: newBalances, cpToPlot: mapping, cpMeta: nextMeta, reservations });
    get().pushEvent('charger', `Removed node on ${plotId} · refunded ${refund} POINTS`);
    get().persist();
  },

  /** Release empty plot (no node): refunds 50% of mint */
  releaseLand: plotId => {
    const { user, grid, balances, sessions, reservations } = get();
    if (!user) throw new Error('Connect a wallet');
    if (sessions[plotId]) throw new Error('Stop any session on this plot first');
    const idx = grid.findIndex(p => p.id === plotId);
    if (idx === -1) return;
    const plot = grid[idx];
    if (plot.owner !== user.pubkey) throw new Error('You do not own this plot');
    if (plot.charger) throw new Error('Remove the node first, then you can release the land');
    const newGrid = grid.slice();
    newGrid[idx] = { ...plot, owner: null, listing: null };
    const newBalances = { ...balances };
    const ob = { ...(newBalances[user.pubkey] || { points: 0, earned: 0, spent: 0 }) };
    const refund = 25;
    ob.points += refund;
    ob.earned += refund;
    newBalances[user.pubkey] = ob;
    const res = { ...reservations };
    delete res[plotId];
    set({ grid: newGrid, balances: newBalances, reservations: res });
    get().pushEvent('land', `Released land ${plotId} · refunded ${refund} POINTS`);
    get().persist();
  },

  /**
   * Book another host's node for a time window (demo). Fee splits ~70% host / 30% network sink.
   */
  reserveSpot: (plotId, durationMins = 30) => {
    const { user, grid, balances, sessions, reservations } = get();
    if (!user) throw new Error('Connect a wallet');
    const plot = grid.find(p => p.id === plotId);
    if (!plot?.charger) throw new Error('Nothing bookable on this plot');
    if (plot.owner === user.pubkey) throw new Error('Use “Start session” on your own node — booking is for guests');
    if (sessions[plotId]) throw new Error('This spot is in use right now');
    const now = Date.now();
    const existing = reservations[plotId];
    if (existing && existing.untilMs > now) throw new Error('Already booked — try another slot or wait for expiry');
    const dm = Math.min(180, Math.max(5, Number(durationMins) || 30));
    const fee = Math.min(120, 20 + Math.floor(dm / 10) * 8);
    if ((balances[user.pubkey]?.points || 0) < fee) throw new Error(`Need ${fee} POINTS to book`);
    const newBalances = { ...balances };
    const booker = { ...(newBalances[user.pubkey] || { points: 0, earned: 0, spent: 0 }) };
    booker.points -= fee;
    booker.spent += fee;
    newBalances[user.pubkey] = booker;
    const hostPk = plot.charger.owner;
    const host = { ...(newBalances[hostPk] || { points: 0, earned: 0, spent: 0 }) };
    const hostShare = Math.floor(fee * 0.7);
    host.points += hostShare;
    host.earned += hostShare;
    newBalances[hostPk] = host;
    const newRes = {
      ...reservations,
      [plotId]: { bookerPubkey: user.pubkey, untilMs: now + dm * 60_000, feePoints: fee, hostPubkey: hostPk },
    };
    set({ balances: newBalances, reservations: newRes });
    get().pushEvent('session', `${user.label} booked ${plotId} for ${dm}m (${fee} pts)`);
    get().persist();
  },

  cancelReservation: plotId => {
    const { user, reservations, balances } = get();
    const r = reservations[plotId];
    if (!r || !user) return;
    const now = Date.now();
    if (now > r.untilMs) {
      const next = { ...reservations };
      delete next[plotId];
      set({ reservations: next });
      get().persist();
      return;
    }
    const isBooker = r.bookerPubkey === user.pubkey;
    const isHost = r.hostPubkey === user.pubkey;
    if (!isBooker && !isHost) throw new Error('Only the booker or host can cancel');
    const newBalances = { ...balances };
    const hostShare = Math.floor(r.feePoints * 0.7);
    const bookerBal = { ...(newBalances[r.bookerPubkey] || { points: 0, earned: 0, spent: 0 }) };
    const hostBal = { ...(newBalances[r.hostPubkey] || { points: 0, earned: 0, spent: 0 }) };
    if (isHost) {
      bookerBal.points += r.feePoints;
      bookerBal.earned += r.feePoints;
      hostBal.points = Math.max(0, hostBal.points - hostShare);
      newBalances[r.bookerPubkey] = bookerBal;
      newBalances[r.hostPubkey] = hostBal;
    } else {
      const refund = Math.floor(r.feePoints * 0.5);
      bookerBal.points += refund;
      bookerBal.earned += refund;
      const claw = Math.floor(hostShare * 0.6);
      hostBal.points = Math.max(0, hostBal.points - claw);
      newBalances[r.bookerPubkey] = bookerBal;
      newBalances[r.hostPubkey] = hostBal;
    }
    const next = { ...reservations };
    delete next[plotId];
    set({ reservations: next, balances: newBalances });
    get().pushEvent('system', `Booking cancelled on ${plotId}`);
    get().persist();
  },

  linkChargePointToPlot: (cpCode, plotId, meta = 3) => {
    const isNum = typeof meta === 'number';
    const powerKw = isNum ? meta : (meta.powerKw ?? 3);
    const extra = isNum
      ? {}
      : {
          category: meta.category,
          vertical: meta.vertical,
          name: meta.name,
          category_label: meta.category_label,
        };
    const mapping = { ...get().cpToPlot };
    mapping[cpCode] = plotId;
    const row = { powerKw, ...extra };
    const nextMeta = { ...get().cpMeta, [cpCode]: row };
    set({ cpToPlot: mapping, cpMeta: nextMeta });
    get().persist();
  },

  startSession: (plotId) => {
    const { user, grid, sessions, balances, reservations } = get();
    if (!user) throw new Error('Connect a wallet');
    const plot = grid.find(p => p.id === plotId);
    if (!plot?.charger) throw new Error('No charger on this plot');
    if (sessions[plotId]) throw new Error('Session already active');
    const now = Date.now();
    const res = reservations[plotId];
    const isOwner = plot.charger.owner === user.pubkey;
    if (!isOwner) {
      if (!res || res.untilMs < now) throw new Error('Book this spot first (or use your own node)');
      if (res.bookerPubkey !== user.pubkey) throw new Error('This window is booked by another wallet');
    }
    const rate = plot.charger.ratePerSec;
    if ((balances[user.pubkey]?.points || 0) < rate) throw new Error('Insufficient points to start');
    const newSessions = { ...sessions, [plotId]: { driver: user.pubkey, startTs: Date.now(), ratePerSec: rate } };
    set({ sessions: newSessions });
    get().pushEvent('session', `${user.label} started a session on ${plotId}`);
    get().persist();
  },

  stopSession: (plotId) => {
    const { sessions } = get();
    if (!sessions[plotId]) return;
    const newSessions = { ...sessions };
    delete newSessions[plotId];
    set({ sessions: newSessions });
    get().pushEvent('session', `Session on ${plotId} stopped`);
    get().persist();
  },

  tick: () => {
    const { sessions, grid, balances } = get();
    const newBalances = { ...balances };
    let changed = false;
    Object.entries(sessions).forEach(([plotId, s]) => {
      const plot = grid.find(p => p.id === plotId);
      if (!plot || !plot.charger) return;
      const driverBal = newBalances[s.driver] || { points: 0, earned: 0, spent: 0 };
      if (driverBal.points < s.ratePerSec) {
        // auto-stop if funds depleted
        get().stopSession(plotId);
        return;
      }
      driverBal.points -= s.ratePerSec;
      driverBal.spent += s.ratePerSec;
      newBalances[s.driver] = driverBal;

      const ownerBal = newBalances[plot.charger.owner] || { points: 0, earned: 0, spent: 0 };
      ownerBal.points += Math.ceil(s.ratePerSec * 0.7);
      ownerBal.earned += Math.ceil(s.ratePerSec * 0.7);
      newBalances[plot.charger.owner] = ownerBal;

      // driver earns rewards too (gamified energy points)
      const driverReward = Math.floor(s.ratePerSec * 0.3);
      driverBal.points += driverReward;
      driverBal.earned += driverReward;
      newBalances[s.driver] = driverBal;
      changed = true;
    });
    if (changed) {
      set({ balances: newBalances });
      get().persist();
    }

    const resAll = get().reservations;
    const sess = get().sessions;
    const now2 = Date.now();
    let nextRes = resAll;
    let resChanged = false;
    const expiredPlots = [];
    Object.entries(resAll).forEach(([pid, r]) => {
      if (now2 > r.untilMs && !sess[pid]) {
        if (!resChanged) {
          nextRes = { ...resAll };
          resChanged = true;
        }
        delete nextRes[pid];
        expiredPlots.push(pid);
      }
    });
    if (resChanged) {
      set({ reservations: nextRes });
      if (expiredPlots.length) {
        get().pushEvent('system', `Booking window ended: ${expiredPlots.join(', ')}`);
      }
      get().persist();
    }
  },

  // Emit a summary settlement event every ~2 seconds for demo purposes
  _lastSettle: 0,
  settleHeartbeat: () => {
    const now = Date.now();
    const last = get()._lastSettle || 0;
    if (now - last < 2000) return;
    const active = Object.keys(get().sessions).length;
    if (active > 0) {
      get().pushEvent('settle', `Batch settled ${active} active session(s)`);
    }
    set({ _lastSettle: now });
  }
}));

// start ticking loop
let ticking = false;
export function startTicker() {
  if (ticking) return;
  ticking = true;
  const loop = () => {
    try {
      const s = useWorldStore.getState();
      s.tick();
      s.settleHeartbeat();
    } catch {}
    setTimeout(loop, 1000);
  };
  loop();
}


