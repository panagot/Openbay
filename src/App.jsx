import React from 'react';
import { WalletBar } from './components/WalletBar.jsx';
import { MapGrid } from './components/MapGrid.jsx';
import { ChargerPanel } from './components/ChargerPanel.jsx';
import { Leaderboard } from './components/Leaderboard.jsx';
import { ActivityFeed } from './components/ActivityFeed.jsx';
import { ChargePointsPanel } from './components/ChargePointsPanel.jsx';
import { StationOwnerPanel } from './components/StationOwnerPanel.jsx';
import { WhyDePINPanel } from './components/WhyDePINPanel.jsx';
import { GoogleMapsView } from './components/GoogleMapsView.jsx';
import { FooterBar } from './components/FooterBar.jsx';
import { StatsHeader } from './components/StatsHeader.jsx';
import { RecentEventsStrip as RecentEvents } from './components/RecentEventsStrip.jsx';
import { OnboardingToast } from './components/OnboardingToast.jsx';

export default function App() {
  const [view, setView] = React.useState(() => {
    try { return localStorage.getItem('vdw_view') || 'grid'; } catch { return 'grid'; }
  });
  React.useEffect(() => { try { localStorage.setItem('vdw_view', view); } catch {} }, [view]);
  return (
    <div className="app">
      <WalletBar />
      <StatsHeader />
      <RecentEvents />
      <main className="layout">
        <section className="left">
          <div className="hero">
            <h2>Turn any parking spot into a revenue-generating EV charging node</h2>
            <p className="subtitle">Virtual DeCharge World — the operating system for independent EV charger owners, powered by World Mobile Chain.</p>
            <p className="hero-entrepreneur">
              <strong>Without a chain identity (DID)</strong>, chargers can’t be trusted, discovered, or monetized in a decentralized way. We give each station a machine identity on World Mobile Chain, verifiable sessions, and direct payments — <strong>real yield from physical chargers</strong>. Any app, fleet operator, or mapping service can integrate and query charger availability via WMC. Map your address, set your spots and rates; this grid is your first station — scale to many.
            </p>
            <p className="hero-inevitable">
              As EV adoption grows, millions of underutilized parking spaces will become micro-infrastructure nodes. Virtual DeCharge World positions World Mobile Chain as a coordination layer for this emerging DePIN economy.
            </p>
          </div>
          <div className="view-toggle-wrap">
            <div className="view-toggle">
              <button className={`tab ${view === 'grid' ? 'active' : ''}`} onClick={() => setView('grid')}>Grid</button>
              <button className={`tab ${view === 'map' ? 'active' : ''}`} onClick={() => setView('map')}>Map</button>
            </div>
            <p className="view-toggle-hint">Grid = garage layout example (spots you own). Map = real-world view with demo stations.</p>
            <WhyDePINPanel />
          </div>
          {view === 'grid' ? <MapGrid /> : <GoogleMapsView />}
        </section>
        <section className="right">
          <ChargerPanel />
          <StationOwnerPanel />
          <Leaderboard />
          <ChargePointsPanel />
          <ActivityFeed />
        </section>
      </main>
      <FooterBar />
      <OnboardingToast />
    </div>
  );
}


