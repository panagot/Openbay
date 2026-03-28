import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from 'ethers';
import { useWorldStore, startTicker } from '../state/store.js';
import { connectPhantomWallet } from '../solana/solanaService.js';

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

export function WalletBar() {
  const [mode, setMode] = useState('local');
  const [localWallet, setLocalWallet] = useState(null);
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
    let savedMode = null;
    try {
      savedMode = localStorage.getItem('vdw_wallet_mode');
      if (savedMode && savedMode !== 'phantom' && savedMode !== 'local') {
        localStorage.setItem('vdw_wallet_mode', 'local');
        savedMode = 'local';
      }
    } catch {
      savedMode = null;
    }
    (async () => {
      if (savedMode === 'phantom') {
        try {
          const { address } = await connectPhantomWallet({ onlyIfTrusted: true });
          ensureUser({
            pubkey: address,
            label: `Phantom ${address.slice(0, 4)}…${address.slice(-4)}`,
            walletKind: 'solana',
          });
          setMode('phantom');
          return;
        } catch {
          /* fall through */
        }
      }
      ensureUser({ pubkey: w.address, label: 'Local Dev Wallet', walletKind: 'local' });
      setMode('local');
    })();
  }, []);

  const handleWalletChange = async newMode => {
    if (newMode === 'phantom') {
      try {
        const { address } = await connectPhantomWallet();
        ensureUser({
          pubkey: address,
          label: `Phantom ${address.slice(0, 4)}…${address.slice(-4)}`,
          walletKind: 'solana',
        });
        setMode('phantom');
        try {
          localStorage.setItem('vdw_wallet_mode', 'phantom');
        } catch {}
      } catch (e) {
        console.error(e);
        alert(e.message || 'Failed to connect Phantom');
      }
    } else {
      setMode('local');
      try {
        localStorage.setItem('vdw_wallet_mode', 'local');
      } catch {}
      if (localWallet) {
        ensureUser({ pubkey: localWallet.address, label: 'Local Dev Wallet', walletKind: 'local' });
      }
    }
  };

  const ChargeIcon = () => (
    <svg
      className="brand-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M13 2L3 14h8l-2 8 10-12h-8l2-8z" />
    </svg>
  );

  return (
    <header className="walletbar">
      <div className="brand-wrap">
        <div className="brand">
          <ChargeIcon />
          <span>OpenBay</span>
        </div>
        <div className="slogan">Host-node sandbox · sessions, signing &amp; API export</div>
      </div>
      <div className="actions">
        <Link to="/lab" className="header-btn header-btn--primary">
          API Lab
        </Link>
        <Link to="/about" className="header-btn">
          About
        </Link>
        <select value={mode} onChange={e => handleWalletChange(e.target.value)}>
          <option value="local">Local Dev Wallet</option>
          <option value="phantom">Phantom (Solana)</option>
        </select>
        {user && (
          <div className="balance">
            <span className="pk">{user.label}</span>
            <span className="pts">
              <span className="balance-val">{currentBal.points}</span> pts
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
