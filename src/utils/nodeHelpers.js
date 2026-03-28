/** Helpers for multi-vertical physical nodes (EV, energy, space, net, civic). */

export function spawnRateFromNode(cp) {
  const kw = cp.connectors?.[0]?.power_kw ?? 3;
  return Math.max(1, Math.round(kw * 0.5));
}

export function hasEnergyPricing(cp) {
  const u = cp.pricing?.energy_based?.unit;
  const r = cp.pricing?.energy_based?.rate;
  return u && u !== 'n/a' && r > 0;
}

/**
 * Secondary line under session stats (map popups).
 */
export function sessionFiatHint(cp, secs, powerKw) {
  const kwh = (powerKw * secs) / 3600;
  const tb = cp.pricing?.time_based;
  const eb = cp.pricing?.energy_based;
  const timePart = tb ? `~${((secs / 60) * tb.rate).toFixed(2)} (${tb.unit})` : '';
  if (!hasEnergyPricing(cp)) {
    return timePart || 'Time-based pricing';
  }
  const energyPart = `~${(kwh * eb.rate).toFixed(2)} (${eb.unit}) · ${kwh.toFixed(3)} kWh equiv`;
  return timePart ? `${energyPart} · ${timePart}` : energyPart;
}

export const CATEGORY_MARKER = {
  ev_charging: '#14f195',
  energy_flex: '#fbbf24',
  mobility_micromobility: '#38bdf8',
  marina_rv: '#22d3ee',
  parking_loading: '#a78bfa',
  space_access: '#f472b6',
  compute_net: '#94a3b8',
  civic_community: '#4ade80',
};

export function markerColorForCategory(category) {
  return CATEGORY_MARKER[category] || '#94a3b8';
}
