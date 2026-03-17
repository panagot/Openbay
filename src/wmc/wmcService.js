/**
 * World Mobile Chain integration: register charger (DID-style) for demo.
 * WMC supports DIDs via Earth Nodes; for the demo we record registration
 * locally and can integrate with WMC identity/registry when available.
 * Uses MetaMask to ensure user is on WMC (chain 869).
 */

const WMC_CHAIN_ID = 869;
const WMC_RPC = import.meta.env.VITE_WMC_RPC || 'https://worldmobilechain-mainnet.g.alchemy.com/v2/demo';
const WMC_EXPLORER = 'https://explorer.worldmobile.io';

async function ensureWmc() {
  if (!window.ethereum) return;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${WMC_CHAIN_ID.toString(16)}` }],
    });
  } catch (e) {
    if (e.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${WMC_CHAIN_ID.toString(16)}`,
          chainName: 'World Mobile Chain',
          nativeCurrency: { name: 'WMTx', symbol: 'WMTX', decimals: 18 },
          rpcUrls: [WMC_RPC],
          blockExplorerUrls: [WMC_EXPLORER],
        }],
      });
    } else throw e;
  }
}

/**
 * Register charger on World Mobile Chain (demo: ensures user is on WMC, records identifier; on-chain registry when available).
 * @param {Object} params - chargerId, ownerAddress, rate, stake, landRef
 * @returns {Promise<{ didName: string, hash?: string }>}
 */
export async function registerChargerOnWmc({ chargerId, ownerAddress, rate, stake, landRef }) {
  if (!window.ethereum) throw new Error('MetaMask required. Connect MetaMask to register on World Mobile Chain.');
  await ensureWmc();
  // WMC DID/registry integration can be added when APIs are available; for demo we record the charger id
  const didName = chargerId;
  return { didName, hash: undefined };
}
