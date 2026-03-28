# Synthesis — Grok, DeepSeek & ChatGPT reviews (Mar 2026)

External LLMs reviewed **OpenBay** (product name evolved from early “DeCharge Lab” / “HostMesh” drafts) against the prompt in [`LLM_FEEDBACK_PROMPT.md`](./LLM_FEEDBACK_PROMPT.md). This document merges their themes and maps them to **product decisions** and **what we implemented in the UI/docs** (still **no hosted backend**).

---

## Shared themes

| Theme | Consensus |
| --- | --- |
| **Sandbox vs production** | Explicit separate keys/environments; UI toggle or copy; Phantom/browser signing ≠ production device trust. |
| **Idempotency** | `Idempotency-Key` on `POST /devices`, `POST /telemetry`, and mutating session calls. |
| **Rate limits** | Document quotas; response headers `X-RateLimit-*`, `Retry-After`. |
| **Device identity** | Nonce/challenge from backend, signed on device; wallet signing only for host UX demos. |
| **Webhooks** | At-least-once delivery, exponential backoff + DLQ, `event_id` + `sequence_number`, HMAC + timestamp, no global ordering guarantee. |
| **API shape** | Keep `/devices`, `/telemetry`, `/stations`, `/sessions`; consider connectors/ports; optional `/gateways`; stick with `/v1` until breaking changes. |
| **UX** | Mixed audience: simplify for **hosts**, keep depth for **OEMs** (toggle or progressive disclosure). |
| **Biggest risk** | Beautiful mock vs **live API** closing the loop — pilots will ask when telemetry is accepted server-side. |

---

## Per-source highlights

- **Grok** — Firmware/OTA mention; UI toggle for sandbox vs prod; webhook subscription management mock; four-week priority list aligned with credibility then webhooks then UX.
- **DeepSeek** — Strong emphasis on **no-backend chasm**; week 1–2 ship minimal hosted API; webhook delivery UI for trust; sandbox vs prod rate limits.
- **ChatGPT** — Human-first copy layer (“device sends live status”) above raw paths; `/events` vs `/telemetry` nuance; batch telemetry; schema_version in payloads; connector-level resources.

---

## Implemented in the codebase (after this review)

1. **Host vs OEM / integrator** — `PersonaToggle` in the hero (and API Lab header); **Host** hides Hardware onboarding, Open API compact, Activity feed; shows an **Integrations** nudge with link to `/lab`. **OEM** restores full sidebar.
2. **Hardware panel** — Sandbox vs production keys copy; `Idempotency-Key` + `schema_version` + rate-limit mention; collapsible **Production hardening** (attestation, error envelope, OTA, gateway vs station).
3. **Open API panel** — Clearer **browser-only mock** disclaimer; **Auth** tab: wallet ≠ device, idempotency, rate-limit headers, mTLS as later phase, **error envelope** example; **cURL** tab: `POST /devices`, `POST /telemetry`, session start with `<api_key_sandbox>` and `<uuid>`.
4. **API Lab** — **`WebhookGuidePanel`**: delivery guarantees, retries/DLQ, ordering, `POST /api/v1/webhooks`, **five expandable example payloads** (`session.started`, `meter_tick`, `ended`, `device.fault`, `device.online`).
5. **Charge Points** — Copy respects persona (points to hero toggle or Hardware panel).
6. **OpenAPI stub** — `docs/openapi-openbay-stub.yaml`: `Idempotency-Key` on POSTs, rate-limit headers, `ErrorEnvelope`, query hints on stations, **`/api/v1/webhooks`**, telemetry `requestBody` with `schema_version`.

---

## Still roadmap (not implemented)

- Hosted REST API + persistence (telemetry → DB → `GET /stations`).
- Real auth, idempotency store, rate limiting, webhook worker + DLQ dashboard.
- `POST /telemetry/batch`, connector sub-resources, optional `GET /webhooks/.../replay`.
- OTA/firmware distribution product surface.

---

## How to use this doc

- **Internal:** Prioritize backlog from the “Still roadmap” section.
- **External:** Pair with [`LLM_FEEDBACK_PROMPT.md`](./LLM_FEEDBACK_PROMPT.md) for the next round of model reviews (“what did we change since your last answer?”).
