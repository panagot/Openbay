# OpenBay

Independent web sandbox for **multi-vertical DePIN-style host nodes** (EV, energy flex, micromobility, marina/RV, parking, space/access, connectivity, civic) with:

- **Grid + map** — sample catalog; spawn into virtual plots; mock or Google Maps (`VITE_GOOGLE_MAPS_API_KEY`).
- **Sessions** — per-second POINTS loop (simulated settlement).
- **Phantom** — optional `signMessage` flow to “anchor” a deployed station (demo only).
- **API Lab** (`/lab`) — JSON exports matching the shape of future `GET /api/v1/stations` and `/sessions`, plus Auth / cURL / **webhook** examples.
- **Hardware onboarding** (in-app + API Lab) — how OEMs, chargers, and gateways align with the same schema (`devices`, `telemetry`, discovery). See `docs/openapi-openbay-stub.yaml` for a minimal OpenAPI stub.
- **External review** — paste `docs/LLM_FEEDBACK_PROMPT.md` into Grok / ChatGPT / DeepSeek; see `docs/FEEDBACK_SYNTHESIS_LLM_REVIEW.md` for merged follow-up.
- **Host vs OEM** — toggle in the hero (and API Lab header); Host mode simplifies the right rail; OEM shows full API onboarding + Open API export.

_Unrelated to [DeCharge Network](https://decharge.network/) and other “DeCharge” brands — **OpenBay** is a separate project name to avoid confusion._

## Quick start

```bash
npm install
npm run dev
```

Optional `.env`: `VITE_GOOGLE_MAPS_API_KEY` — see `.env.example`.

## Build

```bash
npm run build
npm run preview
```

## Stack

Vite, React, Zustand, ethers (local dev key), Phantom (`window.solana`).

---

Not production infrastructure software. Add Solana Pay + real device telemetry for anything customer-facing.
