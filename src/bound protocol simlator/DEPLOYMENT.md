# Deployment and Access Control

Publishing the BOUND platform to Cloudflare Pages with email-gated access.

Everything in the repository is already prepared. What remains needs your Cloudflare login,
so it is written as steps to follow rather than something that can be scripted from here.

---

## The one rule

**Configure the Access policies before the first publish, not after.**

A static host serves whatever is in `dist/` to anyone who knows the URL. Between publishing
and configuring Access there is no gate — the legal opinions and every confidential document
are readable by anyone with the address. Follow the order below and that window never opens.

---

## What is protected, and how

| Tier | Paths | Who gets in |
|---|---|---|
| **Public** | `/bound-whitepaper.html` | Anyone. Bypass policy. |
| **Gated** | Everything else, including the simulator at `/` | Email one-time PIN, allowlist |
| **Restricted** | `/legal/opinions/*`, `/legal/corporate/*` | Named individuals only |
| **Internal** | `/legal/internal/*` | Company officers only — never shared externally |
| **Counterparty** | `/legal/investment/*` | Only parties actually contracting |

The simulator sits at `/`, so gating the site root gates the app, the documentation hub and
every document reached from it. Only the whitepaper is carved out.

**The PDF export needs no separate rule.** Export is the browser printing a page the visitor
is already viewing — if the page is gated, the export is gated with it.

---

## Step 1 · Build

```bash
npm run build
```

Produces `dist/`. Confirm the confidential files are where you expect before going further:

```bash
find dist/legal -type f -name '*.pdf' | sort
# dist/legal/corporate/…   11 formation records
# dist/legal/internal/…     1 counsel engagement letter
# dist/legal/opinions/…     2 token opinions
```

## Step 2 · Create the Pages project

Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
(or **Direct Upload** if the project is not on a Git remote).

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | 20 or later |

Deploy once to a `*.pages.dev` preview URL. **Do not attach the custom domain yet** — the
preview URL is unguessable enough to be a safe staging point, and the next step closes the gap
properly.

## Step 3 · Add the domain

Pages project → **Custom domains** → add `boundprotocol.com` (or the subdomain you intend).

The domain must be on Cloudflare for Access to work — Access is enforced at Cloudflare's edge,
which means the traffic has to pass through it.

## Step 4 · Turn on Zero Trust

Dashboard → **Zero Trust**. On first use it asks for a team name — this becomes your login
domain, `<team>.cloudflareaccess.com`. Choose the **Free** plan: it covers **50 users**
permanently, which is well above what an investor and partner list needs.

Then **Settings → Authentication → Login methods → Add new → One-time PIN**. This is what lets
someone enter an email address and receive a code, with no account to create on their side.

## Step 5 · Create five Access applications

Order matters: create the bypass first so the whitepaper is never briefly gated.

### 5.1 Public whitepaper — bypass

**Access → Applications → Add an application → Self-hosted**

| Field | Value |
|---|---|
| Application name | `BOUND — public whitepaper` |
| Domain | `boundprotocol.com` |
| Path | `bound-whitepaper.html` |

Policy: **Action → Bypass**, Include → **Everyone**.

A more specific path wins over a broader one, so this carve-out survives the site-wide policy
in 5.2.

### 5.2 The platform — email gate

| Field | Value |
|---|---|
| Application name | `BOUND — platform` |
| Domain | `boundprotocol.com` |
| Path | *(leave empty — covers the whole site)* |
| Session duration | 24 hours |

Policy: **Action → Allow**. Under Include choose **Emails** and paste the addresses you are
granting, or **Emails ending in** for a whole partner domain.

Under **Authentication**, enable **One-time PIN**.

### 5.3 Legal vault — named individuals

| Field | Value |
|---|---|
| Application name | `BOUND — legal vault` |
| Domain | `boundprotocol.com` |
| Path | `legal` |
| Session duration | 1 hour |

Policy: **Action → Allow**, Include → **Emails**, listing only the people who should see
counsel opinions and formation records. Keep this list shorter than the platform list — it is
a different tier of trust, not the same one with extra steps.

### 5.4 Internal counsel file — officers only

| Field | Value |
|---|---|
| Application name | `BOUND — internal counsel` |
| Domain | `boundprotocol.com` |
| Path | `legal/internal` |
| Session duration | 1 hour |

Policy: **Action → Allow**, Include → **Emails**, listing company officers only.

This path is more specific than `legal`, so it overrides the vault policy in 5.3 — someone
with diligence access to the opinions does **not** thereby reach this directory.

**Why it is separated.** `/legal/internal/` holds VD Law Group's engagement letter of
11 November 2025. Despite its title it is a fee proposal, not a compliance certification, and
it contains the firm's hourly rates, a line-item cost breakdown, a negotiated preferential
arrangement, and commentary on corporate and tax structuring. None of that belongs in an
investor data room. It is stored here because it is a real corporate record that should not be
lost, and it is fenced because disclosure would be a mistake rather than a decision.

### 5.5 Investment documents — counterparties only

| Field | Value |
|---|---|
| Application name | `BOUND — investment documents` |
| Domain | `boundprotocol.com` |
| Path | `legal/investment` |
| Session duration | 1 hour |

Policy: **Action → Allow**, Include → **Emails**, listing only parties you are actually
contracting with.

Separated from the diligence tier because the form of agreement is not diligence material.
Someone reviewing corporate records has no reason to hold the contract template, and the file
carries a payment wallet address — see the note below.

## Step 6 · Verify before announcing

Test each tier from a private browser window:

- [ ] `/bound-whitepaper.html` opens with no prompt
- [ ] `/` prompts for email, and an address **not** on the list is refused
- [ ] An address **on** the list receives a PIN and gets in
- [ ] `/legal/opinions/legal-opinion-bli.pdf` refuses a platform-tier address
- [ ] A legal-tier address opens it
- [ ] `/legal/corporate/bitswift-share-certificate.pdf` behaves the same way
- [ ] `/legal/internal/vd-engagement-and-compliance-roadmap.pdf` refuses a legal-tier address
      and opens only for an officer address
- [ ] `/legal/investment/saft-draft-2026.docx` refuses a diligence-tier address
- [ ] `/bound-cost-analysis.html` typed directly still prompts — proving the gate is on the
      path and not on the hub's navigation

The last one is the one that matters. If a direct URL loads without a prompt, the policy is
not covering what you think it is.

---

## Seeing who accessed what

**Zero Trust → Logs → Access.** Every authentication attempt: email, application, allow or
deny, timestamp, IP.

This is the visibility you wanted — not "someone opened the deck" but "this address opened the
business plan on this date, and this other address was refused."

Free-plan log retention is shorter than paid. If you need a long access history for
diligence, that is the reason to move to the $7/user/month tier — not the user count.

---

## Adding and removing people

Grant: **Access → Applications → BOUND — platform → Policies** → add the address → save.
Effective immediately; no invitation to send. Tell them to go to the URL and enter that email.

Revoke: remove the address. Any live session ends within the session duration set on the
application — which is why the legal vault uses one hour rather than twenty-four.

---

## Hosting the decks and other files

Anything placed in `public/` is published and inherits the policy covering its path. Two
qualifications.

**Keep large binaries out of Git.** A few hundred kilobytes of PDF is fine. Video, image
libraries and large decks belong in **Cloudflare R2**, which can sit behind the same Access
policy without bloating every clone of the repository.

**Drive is still the right answer for some things.** Incorporation documents and the SAFE
contract are read by a handful of named people and never by a group. Drive already gives
per-person access, revocation and a view log, with no risk of a misconfigured path exposing
them. There is no benefit in moving them.

---

## What is protecting what

Worth being precise, because it is easy to assume otherwise:

- **Access policies** are the security. They are enforced at Cloudflare's edge and the file
  is never served to an unauthenticated request.
- **`_headers`** sets `noindex` and cache rules. Defence in depth, not a gate.
- **`robots.txt`** asks crawlers to stay out. A request, not a control.
- **The application itself has no access control.** Nothing in the React app checks who is
  looking. If the Access policy is removed, everything is public immediately.

A passcode prompt built into the front end would not change this. The files would still be
downloadable by direct URL — which is why the gate is at the edge instead.
