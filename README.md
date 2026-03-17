# DeCharge World · X1 EcoChain ⚡

DePIN dApp for EV charging on [X1 EcoChain](https://x1ecochain.com/) (low-energy, EVM-compatible).

## Concept

**Virtual DeCharge World** is an operating system for independent EV charger owners. It turns parking spots and garages into revenue-generating charging nodes with chain identity (DID), verifiable sessions, and P2P payments. This repo targets **X1 EcoChain** for the [X1 EcoChain Ecosystem Grants Program](https://x1ecochain.com/) (Grant Program $5M).

- **Real-time charging sessions**: Start/stop on virtual plots, per-second settlement, POINTS
- **Map**: Google Maps heatmap and markers (or mock), session cards
- **Chain identity**: Register chargers on X1 EcoChain via MetaMask (demo flow; full registry when X1 APIs are available)
- **DePIN**: Decentralised physical infrastructure — EV charging on X1

### How it fits X1 EcoChain

- **Low-energy, EVM-compatible**: MetaMask, $X1; suited to emerging markets
- **Digital identity (DID)**: One identity per charger for discovery and trust
- **DePIN**: Coordination layer for decentralized EV charging

See [X1 EcoChain](https://x1ecochain.com/), [Ecosystem](https://ecosystem.x1ecochain.com/).

## Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Environment (optional)

Copy `.env.example` to `.env` and optionally set:

- `VITE_GOOGLE_MAPS_API_KEY` — for full Google Maps (heatmap, real tiles). Without it, the app uses a mock map.
- `VITE_X1_CHAIN_ID`, `VITE_X1_RPC`, `VITE_X1_EXPLORER` — replace when X1 publishes official chain config.

### Run

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

### Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project** → Import **panagot/Powering-the-EVolution-on-X1-EcoChain** (or your fork).
2. **Framework Preset:** Vite (or leave Auto).
3. **Root Directory:** `.` (leave default).
4. **Build Command:** `npm run build` · **Output Directory:** `dist`.
5. **Google Maps on Vercel:** In the project → **Settings** → **Environment Variables** → add:
   - **Name:** `VITE_GOOGLE_MAPS_API_KEY`
   - **Value:** *(use the same key as in DeCharge-peaq / DeCharge-wmc — from your `.env` there)*
   - **Environment:** Production (and Preview if you want maps on branch deploys)
   Then **Redeploy** (Deployments → … → Redeploy) so the build picks up the key. Without this, the live site shows the mock map.
6. **Deploy.** If build fails, set **Node.js Version** to 18.x in Project Settings → General.

**Shorter repo name on GitHub:** Repo → **Settings** → **General** → **Repository name** → change to e.g. `DeCharge-X1` or `vdw-x1` → **Rename**. Then in Vercel, reconnect the repo or redeploy (Vercel will follow the new name).

## Features

- **Grid World**: Mint land, deploy chargers, register on X1 (MetaMask). Per-second session settlement and POINTS.
- **Map**: Google Maps or mock; markers, session cards, Share to X.
- **Wallets**: Local Dev Wallet (500 POINTS) or MetaMask (X1). Use MetaMask to **Register on X1** for charger identity.

## Grant application

Draft text for the X1 EcoChain Grant Program form (project abstract, roadmap, 4 milestones, applicant fields) is in the parent folder: **[../X1_GRANT_APPLICATION.md](../X1_GRANT_APPLICATION.md)**. Use it to fill the official application.

## Tech stack

- React 18, Vite, Zustand
- ethers (wallets, EVM)
- `src/x1/x1Service.js` — X1 chain config and charger registration (MetaMask)
- @react-google-maps/api (optional), react-router-dom

---

**Powering the EVolution on X1 EcoChain** ⚡
