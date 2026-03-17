# Virtual DeCharge World — Grant milestones (final, for form)

**Total ask:** $15,000 ($5,000 per milestone)  
**FTE:** 1  
**No ERC-20, no open-source requirement.**

---

## Milestone 1: Production launch and ecosystem visibility

- **Grant amount:** $5,000  
- **Duration:** 4 weeks  
- **FTE:** 1  

**Deliverables:**

1. Acquire a professional domain name and deploy the production website live at the new domain (production site with HTTPS, replacing or alongside current demo URL).
2. Polish and optimize the existing dApp for production: fix UI/UX issues, improve loading and performance, follow wallet-connection best practices, ensure full compatibility with peaq Agung testnet.
3. Set up official social media presence: create and launch accounts on X (Twitter) and Discord (with channels for community and feedback); optional LinkedIn/Telegram; post initial announcement and project teaser.
4. Create basic project documentation: user guide (how to mint, deploy, register chargers, run simulations), FAQ, and “Why peaq?” explainer in the About section.
5. Conduct basic testing: end-to-end checks for wallet connect, grid/map views, session simulation, and peaq ID registration; provide a short test report or summary.
6. Launch the production site publicly and announce via socials (evidence: live URL and social posts or screenshots).

---

## Milestone 2: Trust layer and real-world data integration

- **Grant amount:** $5,000  
- **Duration:** 5 weeks  
- **FTE:** 1  

**Deliverables:**

1. Integrate peaq verify for session attestation: implement on-chain (or verifiable) attestation of charging session data (e.g. duration, energy) using peaq verify so sessions are attested.
2. Add Trust Score to the UI: display a per-charger Trust Score in grid and map views based on verified sessions, peaq ID status, and basic metrics (e.g. uptime, successful attestations).
3. Connect at least one real data source: integrate a public EV charger API (e.g. Open Charge Map or OCPP-compatible endpoint) or a minimal IoT/OCPP prototype to pull real or near-real charging data; show this data in session cards or station details.
4. Develop draft public API/SDK: provide simple REST/JSON endpoints or SDK stubs for charger discovery (e.g. query stations by location, peaq ID status, session history); include API documentation (endpoints, examples, auth if needed).
5. Update documentation: expand user and technical docs to cover peaq verify, Trust Score logic, and real data source usage.
6. Integration testing: test end-to-end flows with verify and real data source; provide a short summary report and demo video or screenshots of the new features on testnet/staging.

---

## Milestone 3: Mainnet deployment and pilot promotion

- **Grant amount:** $5,000  
- **Duration:** 6 weeks  
- **FTE:** 1  

**Deliverables:**

1. Deploy the dApp to peaq mainnet: switch frontend and any config to mainnet RPC/endpoints; ensure peaq ID registration and session flows work on mainnet so real users can interact.
2. Integrate peaq pay for charging sessions: enable P2P micropayments (e.g. via peaq pay/Escrow) so that on session completion, payment flows from user wallet to charger owner.
3. Pilot outreach: contact at least 5–10 potential garage/station owners or EV communities (e.g. via forums, LinkedIn, X, or local EV groups); onboard 2–3 for early testing or feedback (e.g. register real addresses as demo stations).
4. Promotion: run a targeted social campaign (posts, threads on X and Discord about mainnet launch and benefits for entrepreneurs); create promo materials (e.g. short demo video, infographic) and announce pilot participation.
5. Final documentation: update user guide and technical overview (peaq ID, verify, pay); add risks/mitigations summary and a short future roadmap.
6. Final report: provide evidence of mainnet deployment (URLs, sample transactions), peaq pay demo (screenshots or tx links), pilot outreach results (contacts engaged, feedback summary), and promotion metrics (e.g. engagement).

---

**Summary**

| Milestone | Focus                    | Duration | Amount  |
|-----------|--------------------------|----------|---------|
| M1        | Domain, website, socials, launch, docs, testing | 4 weeks  | $5,000  |
| M2        | peaq verify, Trust Score, real data, API/SDK   | 5 weeks  | $5,000  |
| M3        | Mainnet, peaq pay, pilot, promotion, final report | 6 weeks  | $5,000  |

**Total: $15,000 over ~15 weeks, 1 FTE.**

Copy the three milestone sections above (titles + bullet lists) into the grant form. Adjust domain names, timelines, or contact numbers if the form asks for more detail.
