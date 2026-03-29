import React from 'react';
import { Link } from 'react-router-dom';
import { WalletBar } from './components/WalletBar.jsx';
import { MapGrid } from './components/MapGrid.jsx';
import { ChargerPanel } from './components/ChargerPanel.jsx';
import { MySpotsPanel } from './components/MySpotsPanel.jsx';
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
import { OpenApiPanel } from './components/OpenApiPanel.jsx';
import { HardwareApiPanel } from './components/HardwareApiPanel.jsx';
import { PersonaToggle } from './components/PersonaToggle.jsx';
import { SandboxModeStrip } from './components/SandboxModeStrip.jsx';
import { usePersona } from './context/PersonaContext.jsx';

function AppInner() {
  const { persona } = usePersona();
  const [view, setView] = React.useState(() => {
    try { return localStorage.getItem('vdw_view') || 'map'; } catch { return 'map'; }
  });
  const [heroIntroOpen, setHeroIntroOpen] = React.useState(() => {
    try { return localStorage.getItem('vdw_hero_intro_open') === '1'; } catch { return false; }
  });
  React.useEffect(() => { try { localStorage.setItem('vdw_view', view); } catch {} }, [view]);
  React.useEffect(() => {
    try {
      localStorage.setItem('vdw_hero_intro_open', heroIntroOpen ? '1' : '0');
    } catch {}
  }, [heroIntroOpen]);
  return (
    <div className="app">
      <WalletBar />
      <SandboxModeStrip />
      <StatsHeader />
      <div className="recent-sandbox-stack">
        <RecentEvents
          trailing={
            <div className="hero-compact-bar hero-compact-bar--in-strip">
              <div className="hero-kicker">Sandbox · v0.1</div>
              <PersonaToggle idPrefix="home" />
              <button
                type="button"
                className="secondary hero-intro-btn"
                aria-expanded={heroIntroOpen}
                aria-controls="hero-intro-panel"
                id="hero-intro-toggle"
                onClick={() => setHeroIntroOpen(o => !o)}
              >
                {heroIntroOpen ? 'Hide intro' : 'About this sandbox'}
              </button>
            </div>
          }
        />
        <div
          id="hero-intro-panel"
          className="hero-intro-drawer hero-surface"
          role="region"
          aria-labelledby="hero-intro-toggle"
          hidden={!heroIntroOpen}
        >
          <h2>Multi-vertical host operations</h2>
          <p className="hero-tagline">
            Turn parking, power, and edge hardware into bookable infrastructure — explore it here as a browser sandbox.
          </p>
          {persona === 'host' ? (
            <p className="subtitle">
              Run your <strong>slot grid</strong>, spawn sites from the <strong>map catalog</strong>, and simulate{' '}
              <strong>POINTS</strong> sessions. Phantom is optional for signing a station anchor. Building hardware or fleet
              software? Switch to <strong>OEM / integrator</strong> for API &amp; webhook docs.
            </p>
          ) : (
            <p className="subtitle">
              Model EV, flex energy, micromobility, and edge nodes on a slot grid and map. OEMs and gateways target the same
              discovery + session JSON this browser exports—register devices, post telemetry, expose{' '}
              <code className="hero-inline-code">GET /api/v1/stations</code> to fleets (hosted API is roadmap; see{' '}
              <Link to="/lab">API Lab</Link>).
            </p>
          )}
          <p className="hero-footnote">
            <Link to="/about">Product &amp; wallets</Link>
            <span className="hero-footnote-sep" aria-hidden>
              ·
            </span>
            Solana Pay &amp; live backend are roadmap items.
          </p>
        </div>
      </div>
      <main className="layout">
        <section className="left">
          <div className="view-toggle-wrap">
            <div className="view-toggle-row">
              <span className="view-toggle-label" id="workspace-label">
                Workspace
              </span>
              <div className="view-toggle" role="tablist" aria-labelledby="workspace-label">
                <button
                  type="button"
                  role="tab"
                  id="tab-grid"
                  aria-selected={view === 'grid'}
                  aria-controls="workspace-panel"
                  className={`tab ${view === 'grid' ? 'active' : ''}`}
                  onClick={() => setView('grid')}
                >
                  Grid
                </button>
                <button
                  type="button"
                  role="tab"
                  id="tab-map"
                  aria-selected={view === 'map'}
                  aria-controls="workspace-panel"
                  className={`tab ${view === 'map' ? 'active' : ''}`}
                  onClick={() => setView('map')}
                >
                  Map
                </button>
              </div>
            </div>
            <p className="view-toggle-hint">Grid: your slots. Map: sample catalog — spawn nodes into the grid.</p>
            <WhyDePINPanel />
            <div id="workspace-panel" role="tabpanel" aria-labelledby={view === 'grid' ? 'tab-grid' : 'tab-map'}>
              {view === 'grid' ? <MapGrid /> : <GoogleMapsView />}
            </div>
          </div>
        </section>
        <section className="right">
          <ChargerPanel />
          <MySpotsPanel />
          <StationOwnerPanel />
          {persona === 'oem' && (
            <>
              <HardwareApiPanel />
              <Leaderboard />
            </>
          )}
          {persona === 'host' && <Leaderboard />}
          <ChargePointsPanel />
          {persona === 'oem' && (
            <>
              <OpenApiPanel compact />
              <ActivityFeed />
            </>
          )}
          {persona === 'host' && (
            <div className="panel host-integrator-nudge">
              <h3>Integrations</h3>
              <p className="muted small" style={{ marginBottom: 0 }}>
                Hardware vendors and fleets: switch to <strong>OEM / integrator</strong> above for the API onboarding panel,
                Open API export, and activity log—or open <Link to="/lab">API Lab</Link> directly.
              </p>
            </div>
          )}
        </section>
      </main>
      <FooterBar />
      <OnboardingToast />
    </div>
  );
}

export default function App() {
  return <AppInner />;
}

