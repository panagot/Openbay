# Repository policy — OpenBay

| Repository | Role |
|------------|------|
| **[panagot/Openbay](https://github.com/panagot/Openbay)** | **Only** canonical source for OpenBay product code, docs, and demo deploys tied to OpenBay. |
| Other repos (e.g. X1 EcoChain grant archives) | **Not** targets for OpenBay feature work or routine `master` pushes. |

All new OpenBay features, copy, API docs, and UI fixes go **here** → Openbay `master`, then Vercel (e.g. openbay-one) as configured.

If you need a second codebase (e.g. chain-specific grant snapshot), treat it as a **separate product line** with its own clone and default `git remote`, not a second push target for OpenBay.
