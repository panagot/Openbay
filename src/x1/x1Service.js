/**
 * X1 EcoChain integration: register charger (DID-style) for demo.
 * X1 is a low-energy, EVM-compatible blockchain; for the demo we record
 * registration locally and can integrate with X1 identity/registry when available.
 * Uses MetaMask to ensure user is on X1 (chain config below).
 */

// Replace with official X1 chain ID and RPC when published by X1 EcoChain
const X1_CHAIN_ID = parseInt(import.meta.env.VITE_X1_CHAIN_ID || '2024', 10);
const X1_RPC = import.meta.env.VITE_X1_RPC || 'https://rpc.x1.eco';
const X1_EXPLORER = import.meta.env.VITE_X1_EXPLORER || 'https://explorer.x1.eco';

async function ensureX1() {
  if (!window.ethereum) return;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${X1_CHAIN_ID.toString(16)}` }],
    });
  } catch (e) {
    if (e.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${X1_CHAIN_ID.toString(16)}`,
          chainName: 'X1 EcoChain',
          nativeCurrency: { name: 'X1', symbol: 'X1', decimals: 18 },
          rpcUrls: [X1_RPC],
          blockExplorerUrls: [X1_EXPLORER],
        }],
      });
    } else throw e;
  }
}

/**
 * Register charger on X1 EcoChain (demo: ensures user is on X1, records identifier; on-chain registry when available).
 * @param {Object} params - chargerId, ownerAddress, rate, stake, landRef
 * @returns {Promise<{ didName: string, hash?: string }>}
 */
export async function registerChargerOnX1({ chargerId, ownerAddress, rate, stake, landRef }) {
  if (!window.ethereum) throw new Error('MetaMask required. Connect MetaMask to register on X1 EcoChain.');
  await ensureX1();
  const didName = chargerId;
  return { didName, hash: undefined };
}

export { X1_CHAIN_ID, X1_RPC, X1_EXPLORER };
