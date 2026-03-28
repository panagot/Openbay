/**
 * Solana (Phantom) — station anchor via signed message (experiment).
 * No on-chain registry in this MVP: signature proves owner intent for demos / grants.
 */

export function getPhantom() {
  if (typeof window === 'undefined') return null;
  const p = window.phantom?.solana;
  if (p?.isPhantom) return p;
  if (window.solana?.isPhantom) return window.solana;
  return window.solana || null;
}

export async function connectPhantomWallet({ onlyIfTrusted = false } = {}) {
  const provider = getPhantom();
  if (!provider) {
    throw new Error('Install Phantom (https://phantom.app/) to use Solana mode.');
  }
  const resp = await provider.connect({ onlyIfTrusted });
  const pk = resp?.publicKey ?? provider.publicKey;
  const address = typeof pk?.toBase58 === 'function' ? pk.toBase58() : pk?.toString?.();
  if (!address) throw new Error('Phantom did not return a public key.');
  return { address, provider };
}

/**
 * @returns {{ stationId: string, sigPreview: string }}
 */
export async function anchorStationWithPhantom({ chargerId, ownerBase58, plotId }) {
  const provider = getPhantom();
  if (!provider?.isConnected) {
    throw new Error('Connect Phantom from the wallet bar first.');
  }
  const pk = provider.publicKey;
  const connected = typeof pk?.toBase58 === 'function' ? pk.toBase58() : pk?.toString?.();
  if (connected !== ownerBase58) {
    throw new Error('Phantom account does not match the active user. Reconnect Phantom.');
  }
  const payload = `OpenBay | Station anchor\nnetwork:solana-devnet\ncharger:${chargerId}\nowner:${ownerBase58}\nplot:${plotId}\nts:${Date.now()}`;
  const encoded = new TextEncoder().encode(payload);
  const out = await provider.signMessage(encoded);
  const signature = out?.signature;
  const bytes = signature instanceof Uint8Array ? signature : new Uint8Array(signature);
  let bin = '';
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  const sigPreview = `${btoa(bin).slice(0, 28)}…`;
  return { stationId: chargerId, sigPreview, payload };
}
