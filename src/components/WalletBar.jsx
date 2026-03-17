import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from 'ethers';
import { useWorldStore, startTicker } from '../state/store.js';

const WMC_CHAIN_ID = 869;
const WMC_RPC = import.meta.env.VITE_WMC_RPC || 'https://worldmobilechain-mainnet.g.alchemy.com/v2/demo';

function generateLocalKey() {
  const existing = localStorage.getItem('vdw_dev_wallet');
  if (existing) {
    try {
      const obj = JSON.parse(existing);
      if (obj?.address && obj?.privateKey) return obj;
    } catch {}
  }
  const wallet = Wallet.createRandom();
  const obj = { address: wallet.address, privateKey: wallet.privateKey };
  localStorage.setItem('vdw_dev_wallet', JSON.stringify(obj));
  return obj;
}

async function connectMetaMask() {
  if (!window.ethereum) throw new Error('MetaMask not installed');
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  if (!accounts?.[0]) throw new Error('No account selected');
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
          blockExplorerUrls: ['https://explorer.worldmobile.io'],
        }],
      });
    } else throw e;
  }
  return { address: accounts[0], isMetaMask: true };
}

export function WalletBar() {
  const [mode, setMode] = useState('local');
  const [localWallet, setLocalWallet] = useState(null);
  const [metaMaskAddr, setMetaMaskAddr] = useState(null);
  const user = useWorldStore(s => s.user);
  const ensureUser = useWorldStore(s => s.ensureUser);
  const initFromStorage = useWorldStore(s => s.initFromStorage);
  const balances = useWorldStore(s => s.balances);

  const currentBal = useMemo(() => {
    if (!user) return { points: 0, earned: 0, spent: 0 };
    return balances[user.pubkey] || { points: 0, earned: 0, spent: 0 };
  }, [user, balances]);

  useEffect(() => {
    initFromStorage();
    startTicker();
    const w = generateLocalKey();
    setLocalWallet(w);
    ensureUser({ pubkey: w.address, label: 'Local Dev Wallet' });
  }, []);

  const handleWalletChange = async (newMode) => {
    if (newMode === 'metamask') {
      try {
        const { address } = await connectMetaMask();
        setMetaMaskAddr(address);
        ensureUser({ pubkey: address, label: `MetaMask ${address.slice(0, 6)}…${address.slice(-4)}` });
        setMode('metamask');
      } catch (e) {
        console.error(e);
        alert(e.message || 'Failed to connect MetaMask');
      }
    } else {
      setMode('local');
      if (localWallet) ensureUser({ pubkey: localWallet.address, label: 'Local Dev Wallet' });
    }
  };

  const ChargeIcon = () => (
    <svg className="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />
    </svg>
  );

  return (
    <header className="walletbar">
      <div className="brand-wrap">
        <div className="brand">
          <ChargeIcon />
          <span>Virtual DeCharge World</span>
        </div>
        <div className="slogan">Powering the EVolution on World Mobile Chain</div>
      </div>
      <div className="actions">
        <Link to="/about"><button className="about-btn">What is this?</button></Link>
        <select value={mode} onChange={e => handleWalletChange(e.target.value)}>
          <option value="local">Local Dev Wallet</option>
          <option value="metamask">Connect MetaMask (WMC)</option>
        </select>
        {user && (
          <div className="balance">
            <span className="pk">{user.label}</span>
            <span className="pts">{currentBal.points} POINTS</span>
          </div>
        )}
      </div>
    </header>
  );
}
