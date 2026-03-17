import React from 'react';
import { Link } from 'react-router-dom';
import { FooterBar } from '../components/FooterBar.jsx';
import { WalletBar } from '../components/WalletBar.jsx';
import { StatsHeader } from '../components/StatsHeader.jsx';

export function About() {
  return (
    <div className="app">
      <WalletBar />
      <StatsHeader />
      <main className="layout">
        <section className="left">
          <h2>What is Virtual DeCharge World?</h2>
          <p className="muted">Operating system for independent EV charger owners — powered by X1 EcoChain.</p>

          <div className="panel">
            <h3>Problem</h3>
            <p>
              EV charging is fragmented. If you own a charging station in your garage or small business, you’re often invisible. You rely on word-of-mouth or expensive aggregators. There’s no standard way to be discoverable, prove reliability, or capture 100% of revenue without intermediaries.
            </p>
          </div>

          <div className="panel">
            <h3>Solution</h3>
            <p>
              Virtual DeCharge World gives station owners a <strong>digital identity on X1 EcoChain</strong> to become discoverable, a <strong>reputation system</strong> (verifiable sessions) to build trust, and a <strong>direct payment channel</strong> on X1 to keep 100% of revenue. We bridge real charging behavior with on-chain engagement: own virtual plots (garage layout), deploy chargers, run sessions with per-second settlement and POINTS.
            </p>
            <ul>
              <li>Grid = configurable garage/lot layout; Map = real-world view with heatmap and markers</li>
              <li>Drivers pay per second, owners earn yield, drivers earn rewards</li>
              <li>Chain identity (DID) per charger; verifiable sessions; P2P payments on X1 (roadmap)</li>
            </ul>
          </div>

          <div className="panel">
            <h3>Open network, not just an app</h3>
            <p className="muted">
              Virtual DeCharge World is an <strong>open coordination layer</strong>: any charger can register, expose availability, and be discovered by drivers or third-party apps. We don’t own the customer relationship or data — the charger owner controls identity, data, and revenue. We will expose a <strong>public API/SDK</strong> for third-party apps to integrate charger discovery, pricing, and session data.
            </p>
            <p>Charger Registry (on X1) + Session Events (on-chain or verifiable) + Public API/SDK (planned).</p>
          </div>

          <div className="panel">
            <h3>Why X1 EcoChain</h3>
            <p className="muted">
              Without a chain identity (DID), chargers cannot be trusted, discovered, or monetized in a decentralized way. We build on X1 EcoChain for machine identity, verifiable sessions, and payments — DePIN for physical infrastructure.
            </p>
            <ul>
              <li>Reward engine: points for energy/time with transparent settlement</li>
              <li>DePIN ethos: community-owned charging assets, clear economics</li>
              <li>EVM-compatible: MetaMask, X1 EcoChain, $X1</li>
            </ul>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a className="secondary" href="https://x1ecochain.com/" target="_blank" rel="noreferrer">X1 EcoChain</a>
              <a className="secondary" href="https://ecosystem.x1ecochain.com/" target="_blank" rel="noreferrer">Ecosystem</a>
            </div>
          </div>

          <div className="panel">
            <h3>Differentiation</h3>
            <p className="muted">
              The EV charging space has aggregators (e.g. PlugShare) and other DePINs (e.g. charge.xyz, Combinder). We position as complementary:
            </p>
            <ul>
              <li><strong>Protocol, not just an app</strong> — We give each station its own on-chain identity and economic model; we don’t own the customer relationship or data.</li>
              <li><strong>Hardware-agnostic</strong> — We aim to retrofit existing “dumb” and smart chargers with an X1-powered digital twin (OCPP / IoT integration in roadmap).</li>
              <li><strong>Grid-as-garage</strong> — Virtual land ownership and configurable spots for entrepreneurs; multi-location dashboard vision.</li>
            </ul>
            <div className="comparison-block">
              <p className="muted" style={{ marginBottom: 8 }}><strong>Centralized networks</strong> (e.g. ChargePoint, PlugShare): directories owned by corporations; closed systems; high fees. <strong>Virtual DeCharge World</strong>: permissionless onboarding, machine-native identity (DID on X1), peer-to-peer payments. We are an ownership layer — we empower hosts, not just list them.</p>
            </div>
          </div>

          <div className="panel">
            <h3>For entrepreneurs & garage owners</h3>
            <p className="muted">The grid view is an example layout for a single garage or lot with multiple charging spots.</p>
            <ul>
              <li><strong>Pin your address on the map</strong> — Register your real-world location so drivers can find you.</li>
              <li><strong>Register your profile</strong> — Get a chain identity (DID) for your station(s) on X1; verifiable, on-chain.</li>
              <li><strong>Set your spots & grid</strong> — Define how many spots you have; adjust the grid to match your lot.</li>
              <li><strong>Set your rates</strong> — Time-based or energy-based pricing; you earn, drivers pay on X1.</li>
            </ul>
            <p>With grant support: multi-location dashboard, real-world address registration, verifiable session attestation on X1.</p>
            <p className="real-yield-note"><strong>Real yield (illustrative):</strong> A garage owner with 2 chargers operating 6 hours/day at typical rates could generate on the order of €100–300/month depending on location and utilization — revenue that stays 100% with the owner via X1.</p>
          </div>

          <div className="panel">
            <h3>Path to real infrastructure</h3>
            <ul className="roadmap-list">
              <li><strong>Phase 1 (current)</strong> — Simulated sessions in the demo; charger registration live on X1.</li>
              <li><strong>Phase 2</strong> — Integration with existing EV charger APIs (status, availability).</li>
              <li><strong>Phase 3</strong> — Direct IoT integration (OCPP, ESP32 / Raspberry Pi) so real hardware reports telemetry → X1 → app.</li>
              <li><strong>Phase 4</strong> — Fully autonomous machine-to-machine payments on X1; composability with other X1 DePINs (e.g. energy from Combinder).</li>
            </ul>
            <p className="muted">Data sovereignty: usage and uptime belong to the Machine NFT owner; shared for discovery but not owned by a central platform.</p>
          </div>

          <div className="panel">
            <h3>Roadmap (phased, with KPIs)</h3>
            <ul className="roadmap-list">
              <li><strong>Phase 1 (grant period)</strong> — Session logging and identity on X1; DID per charger (done in demo); session logging on-chain; demonstrate 100+ simulated sessions and 5+ demo stations with verifiable “Reliability Score” in UI.</li>
              <li><strong>Phase 2</strong> — Verifiable session integration; real-time session attestation; Trust Score per station from verified data.</li>
              <li><strong>Phase 3</strong> — P2P payments on X1; real EV charger API or IoT integration (OCPP / ESP32 or Raspberry Pi) to bridge digital and physical.</li>
            </ul>
          </div>

          <div className="panel">
            <h3>POINTS & tokenomics (sketch)</h3>
            <p className="muted">
              POINTS today = in-demo rewards; roadmap = In-app POINTS and future token as incentive layer for decentralized infrastructure growth.
            </p>
            <ul>
              <li>Rewards for uptime, availability, and usage</li>
              <li>Charger owners may stake POINTS to appear higher in discovery (e.g. map view) — securing the network while promoting their business</li>
              <li>Machine NFT / charger as economic asset: sellable, transferable, or usable as collateral; session data attached to machine ID</li>
            </ul>
          </div>

          <div className="panel why-fund">
            <h3>Why fund us — platform add-ons for X1 EcoChain</h3>
            <ul>
              <li><strong>DID per charger</strong> — Discoverable, verifiable machine identity on X1</li>
              <li><strong>Verifiable sessions</strong> — Attested sessions (energy, time, location) for audits and rewards</li>
              <li><strong>P2P payments on X1</strong> — No middleman</li>
              <li><strong>Multi-location dashboard</strong> — Entrepreneurs manage multiple garages in one place</li>
              <li><strong>Real-world address registration</strong> — Pin on map, geocode, link to chain ID</li>
              <li><strong>Machine DeFi</strong> — Staking, yield for owners; rewards for drivers</li>
            </ul>
          </div>

          <div className="panel">
            <h3>Risks & mitigation</h3>
            <ul>
              <li><strong>Hardware adoption</strong> — Start with simulation + APIs; roadmap includes OCPP / IoT to prove digital–physical bridge.</li>
              <li><strong>User trust</strong> — Chain identity + verifiable sessions for verifiable reputation and session data.</li>
              <li><strong>Payments</strong> — X1 payment integration for direct, programmable settlements.</li>
              <li><strong>Regulatory</strong> — P2P energy resale varies by region; model allows compliance at entrepreneur level (platform provides tools; owners comply locally).</li>
            </ul>
          </div>

          <div className="panel">
            <h3>Grant ask ($1K–$50K range)</h3>
            <p className="muted">Grant will be used to deliver:</p>
            <ul>
              <li>Session and identity on X1</li>
              <li>Implement verifiable session attestation (Trust Score)</li>
              <li>Launch initial public charger registry on X1</li>
              <li>Integrate at least one real-world data source (EV charger API or IoT prototype)</li>
            </ul>
            <p className="muted" style={{ marginTop: 12 }}>Indicative budget: ~$7K dev (mainnet + verify/pay), ~$5K marketing/pilots (e.g. India outreach), ~$4K testing/audit buffer, ~$4K misc (tools, demos).</p>
            <p style={{ marginTop: 12 }}>We request a call or demo session to align milestones with peaq’s priorities.</p>
          </div>

          <div style={{ marginTop: 8 }}>
            <Link to="/"><button>Back to App</button></Link>
          </div>
        </section>
        <section className="right">
          <div className="panel">
            <h3>Quick links</h3>
            <p className="muted">Live demo, docs, and grant program.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a className="secondary" href="https://x1ecochain.com/" target="_blank" rel="noreferrer">X1 EcoChain</a>
              <a className="secondary" href="https://ecosystem.x1ecochain.com/" target="_blank" rel="noreferrer">Ecosystem</a>
            </div>
          </div>
        </section>
      </main>
      <FooterBar />
    </div>
  );
}
