# Virtual DeCharge World on X1 EcoChain ⚡

This is the **X1 EcoChain** version of Virtual DeCharge World — a DePIN dApp for EV charging, built for the [X1 EcoChain](https://x1.eco) ecosystem (low-energy, EVM-compatible blockchain).

## Concept

**Virtual DeCharge World** is an operating system for independent EV charger owners. It turns parking spots and garages into revenue-generating charging nodes with chain identity (DID), verifiable sessions, and P2P payments. This repo targets **X1 EcoChain** for the [X1 EcoChain Ecosystem Grants Program](https://x1.eco).

- **Real-time charging sessions**: Start/stop on virtual plots, per-second settlement, POINTS
- **Map**: Google Maps heatmap and markers (or mock), session cards
- **Chain identity**: Register chargers on X1 EcoChain via MetaMask (demo flow; full registry when X1 APIs are available)
- **DePIN**: Decentralised physical infrastructure — EV charging on X1

### How it fits X1 EcoChain

- **Low-energy, EVM-compatible**: MetaMask, $X1; suited to emerging markets
- **Digital identity (DID)**: One identity per charger for discovery and trust
- **DePIN**: Coordination layer for decentralized EV charging

See [X1 EcoChain](https://x1.eco), [X1 X](https://x.com/X1_EcoChain).

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
