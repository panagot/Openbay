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

const persistKey = 'vdw_state_v1';

function loadState() {
  try {
    const raw = localStorage.getItem(persistKey);
    if (!raw) return null;
    return JSON.parse(raw);
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
  user: null, // { pubkey, label }
  balances: {}, // pubkey -> { points: number, earned: number, spent: number }
  sessions: {}, // plotId -> { driver, startTs, ratePerSec }
  cpToPlot: {}, // charge point code -> plotId
  cpMeta: {}, // charge point code -> { powerKw: number }
  events: [],

  initFromStorage: () => {
    const snap = loadState();
    if (!snap) return;
    set(snap);
  },

  persist: () => {
    const { grid, rows, cols, user, balances, sessions, events } = get();
    saveState({ grid, rows, cols, user, balances, sessions, events });
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
    newGrid[idx] = { ...plot, charger: { ratePerSec, staked: stake, owner: user.pubkey, peaqDid: null } };
    const newBalances = { ...balances };
    newBalances[user.pubkey].points -= stake;
    newBalances[user.pubkey].spent += stake;
    set({ grid: newGrid, balances: newBalances });
    get().pushEvent('charger', `${user.label} deployed a charger on ${plotId} (rate ${ratePerSec}/s)`);
    get().persist();
  },

  updateChargerPeaqDid: (plotId, didName) => {
    const { grid } = get();
    const idx = grid.findIndex(p => p.id === plotId);
    if (idx === -1 || !grid[idx].charger) return;
    const newGrid = grid.slice();
    newGrid[idx] = { ...newGrid[idx], charger: { ...newGrid[idx].charger, peaqDid: didName } };
    set({ grid: newGrid });
    get().pushEvent('peaq', `Charger ${plotId} → WMC ID ${didName}. Verifiable identity on-chain; service history builds trust with drivers.`);
    get().persist();
  },

  linkChargePointToPlot: (cpCode, plotId, powerKw = 3) => {
    const mapping = { ...get().cpToPlot };
    mapping[cpCode] = plotId;
    const meta = { ...get().cpMeta, [cpCode]: { powerKw } };
    set({ cpToPlot: mapping, cpMeta: meta });
    get().persist();
  },

  startSession: (plotId) => {
    const { user, grid, sessions, balances } = get();
    if (!user) throw new Error('Connect a wallet');
    const plot = grid.find(p => p.id === plotId);
    if (!plot?.charger) throw new Error('No charger on this plot');
    if (sessions[plotId]) throw new Error('Session already active');
    const rate = plot.charger.ratePerSec;
    if ((balances[user.pubkey]?.points || 0) < rate) throw new Error('Insufficient points to start');
    const newSessions = { ...sessions, [plotId]: { driver: user.pubkey, startTs: Date.now(), ratePerSec: rate } };
    set({ sessions: newSessions });
    get().pushEvent('session', `${user.label} started charging on ${plotId}`);
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


