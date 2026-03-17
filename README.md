# Virtual DeCharge World on World Mobile Chain ⚡

This is the **World Mobile Chain (WMC)** version of Virtual DeCharge World — the same DePIN prototype for EV charging, built for [World Mobile Chain](https://worldmobile.io/the-chain) (EVM L3 on Base, chain ID 869).

## Concept

**Virtual DeCharge World** is an operating system for independent EV charger owners. It turns parking spots and garages into revenue-generating charging nodes with chain identity (DID), verifiable sessions, and P2P payments. This repo targets **WMC** for the [World Mobile Chain Grant Programme](https://grants.worldmobiletoken.com/).

- **Real-time charging sessions**: Start/stop on virtual plots, per-second settlement, POINTS
- **Map**: Google Maps heatmap and markers (or mock), session cards
- **Chain identity**: Register chargers on World Mobile Chain via MetaMask (demo flow; full DID/registry when WMC APIs available)
- **DePIN**: Decentralised physical infrastructure — EV charging on WMC

### How it fits World Mobile Chain

- **Decentralisation of physical infrastructure**: EV charging as DePIN
- **Digital identity (DID)**: One identity per charger for discovery and trust
- **EVM-compatible**: MetaMask, WMC mainnet (869), WMTx

See [World Mobile Chain](https://worldmobile.io/the-chain), [WMC Grants](https://grants.worldmobiletoken.com/), [@wmchain](https://x.com/wmchain).

## Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Environment (optional)

Copy `.env.example` to `.env` and optionally set:

```env
# Optional: full Google Maps (heatmap, real tiles). Without it, the app uses a built-in mock map.
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Google Maps**: Get a key at [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials). Enable **Maps JavaScript API**. Without a key, the app still runs with the mock map (no API required).

### Run

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

### Deploying to Vercel (Google Maps on production)

The app reads the Google Maps API key from `VITE_GOOGLE_MAPS_API_KEY`. Your `.env` file is not committed to Git, so **Vercel does not have the key** unless you add it there.

1. In [Vercel](https://vercel.com): open your project → **Settings** → **Environment Variables**.
2. Add a variable:
   - **Name:** `VITE_GOOGLE_MAPS_API_KEY`
   - **Value:** your Google Maps API key
   - **Environment:** Production (and optionally Preview if you want maps on branch deploys).
3. **Redeploy** the project (Deployments → … → Redeploy) so the new variable is used in the build.

After that, the live site (e.g. `https://powering-the-e-volution-on-peaq.vercel.app/`) will get the key at build time and the Map view will use the real Google Maps API.

**Security:** Restrict the key in [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (e.g. HTTP referrers: `https://powering-the-e-volution-on-peaq.vercel.app/*` and `https://*.vercel.app/*`) so it can’t be abused if it ever leaks.

## Features

### 🌍 Grid World

- **8×12 plot grid**: Mint land (50 POINTS), deploy chargers with stake (100 POINTS)
- **Per-second settlement**: Drivers pay rate per second; owners earn ~70% yield; drivers earn ~30% rewards
- **Register on peaq**: After deploying a charger, click **Register on peaq** (MetaMask) to create a peaq ID (DID) for that charger on peaq agung testnet
- **Activity feed**: Real-time events for land, charger, sessions, and peaq registration

### 🗺️ Map (Google Maps or mock)

- **With API key**: Full Google Maps — heatmap, markers, session cards, filters (Active only, DC only, Min kW), Share to X
- **Without API key**: Built-in mock map with same session logic; clear instructions in the UI to add `VITE_GOOGLE_MAPS_API_KEY` for the full experience

### 👛 Wallets

- **Local Dev Wallet**: Auto-generated (ethers); 500 POINTS to start; no network required
- **MetaMask**: Connect and switch to peaq agung testnet (Chain ID 9990); use for **Register on peaq**. Get test PEAQ from the [peaq faucet](https://docs.peaq.xyz/build/getting-started/get-test-tokens) if you need gas for on-chain txs

## Demo path

1. **Mint & deploy**: On the grid, mint a plot (50 POINTS) and deploy a charger (stake 100). Or use **Spawn virtual** in the right panel from sample charge points.
2. **Register on peaq**: Connect MetaMask (peaq agung), then click **Register on peaq** on your charger cell. Sign the tx to create a peaq ID for the charger.
3. **Map**: Switch to the Map tab. Start a session from a marker; watch the Activity feed and settlement every 2s.
4. **Share**: Stop session → **Share to X** from the session card.

## Architecture

### Current

- **Frontend**: React + Vite, Zustand
- **Wallet**: ethers (local) + MetaMask (peaq agung)
- **Maps**: Google Maps API (optional) or mock; `@react-google-maps/api`
- **peaq**: `@peaq-network/sdk` + ethers; DID create for chargers via MetaMask
- **Storage**: LocalStorage (state, preferences)

### Roadmap on peaq

- **peaq verify**: Session/usage attestation
- **peaq pay**: P2P charging payments
- **POINTS**: ERC-20 on peaq; batch settlement

## Tech stack

- React 18, Vite, Zustand
- ethers (wallets, EVM)
- @peaq-network/sdk (peaq ID / DID)
- @react-google-maps/api (optional), react-router-dom

## References

- [peaq](https://www.peaq.xyz/)
- [peaq Docs](https://docs.peaq.xyz/)
- [peaq Grant Program](https://www.peaq.xyz/build/grant-program)
- [peaq Discord](https://discord.gg/peaqnetwork)
- [Google Maps Platform](https://developers.google.com/maps)

---

**Powering the EVolution on peaq** ⚡
