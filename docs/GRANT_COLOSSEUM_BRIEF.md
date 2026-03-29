# OpenBay — grant & Colosseum positioning

**Canonical repository:** [github.com/panagot/Openbay](https://github.com/panagot/Openbay)  
**Live demo:** [openbay-one.vercel.app](https://openbay-one.vercel.app/) · **API Lab:** `/lab`

Do **not** ship OpenBay product changes to other GitHub repos. One product, one remote for releases: **`openbay` → panagot/Openbay**.

---

## One-line thesis

OpenBay is a **multi-vertical slot inventory and session layer** for DePIN-style physical assets—starting with host-operated nodes (EV, parking, docks, flex energy)—with a **stable HTTP contract** (discovery, sessions, telemetry) and **optional Solana** (`signMessage`) demos so fleets and hardware can integrate before a hosted backend exists.

---

## Problem

- Physical operators (chargers, lots, marinas, depots) need a **simple way to expose “what I have, what’s busy, what it costs”** to maps, apps, and agents.
- Builders default to **one-off integrations** or siloed parking/EV stacks; **no shared schema** for “slot + session + device” across verticals.
- Grantors and hackathon judges look for **clarity, a demo, and a path to production**—not only a whitepaper.

---

## Solution (what OpenBay is)

1. **Operator UX** — Grid + map workspace, listings, bookings (demo POINTS), host vs OEM modes.
2. **Integrator contract** — Documented JSON aligned with future `GET /api/v1/stations` and `/sessions`, OpenAPI stub, webhooks story, idempotency/rate-limit notes (`docs/openapi-openbay-stub.yaml`).
3. **Solana alignment** — Phantom `signMessage` “anchor” as a **credibility and roadmap** hook (on-chain settlement / Solana Pay as next steps—fits Solana DePIN and Colosseum-style tracks).
4. **Honest sandbox** — Browser-local mock with explicit **sandbox strip** and docs so reviewers are not misled about what is live vs roadmap.

---

## Why this can win attention (grants / Colosseum)

| Angle | OpenBay hook |
|--------|----------------|
| **DePIN** | Physical slots, discovery, sessions—not purely financialized NFT play. |
| **Multi-vertical** | Same model for EV, parking, loading bays, marina/RV (named in product). |
| **API-first** | OEMs and gateways are first-class; UI is the demo, contract is the product. |
| **Solana** | Low-friction signing story; room for Solana Pay + program-based settlement in milestones. |
| **Shipping** | Working UI + API Lab + deployable static app reduces “vapor” risk. |

---

## Suggested milestones (grant-friendly)

1. **M1 — Contract freeze v0.2** — Tenant/site/slot fields in OpenAPI; example payloads for parking + EV in docs.
2. **M2 — Hosted read API** — `GET /stations` + `GET /sessions` backed by DB; sandbox API keys.
3. **M3 — Writes** — Device registration + telemetry ingest (HMAC), minimal booking persistence.
4. **M4 — Solana** — Solana Pay or program hook for session invoice / settlement (scope to one vertical first).

---

## Colosseum / hackathon pitch (60 seconds)

“We’re building **OpenBay**: infrastructure for **bookable physical slots**—chargers, parking, docks—so any app can **discover capacity and start sessions** over a **single REST shape**. The **browser sandbox** proves the loop today; the **OpenAPI stub** is what fleets and OEMs integrate against. Next we add a **hosted API** and **Solana Pay** so settlement matches how Solana DePIN actually runs at scale.”

---

## Repo workflow (avoid mixing again)

From a clone that has multiple remotes:

```bash
# Ship OpenBay only
git push openbay master

# Do not push OpenBay work to other repos unless you intentionally maintain a frozen fork.
```

Optional hygiene: use a **dedicated folder** cloned **only** from `panagot/Openbay`, with `origin` = Openbay, so `git push` cannot hit the wrong repo by mistake.

---

## Links for judges

- Repo: [github.com/panagot/Openbay](https://github.com/panagot/Openbay)
- Demo: [openbay-one.vercel.app](https://openbay-one.vercel.app/)
- OpenAPI stub (repo): `docs/openapi-openbay-stub.yaml`
- Reviewer prompt: `docs/LLM_FEEDBACK_PROMPT.md`
