# x402view Data Schema

## Entity Hierarchy

```
Project
├── metadata (name, description, links)
├── logo (200x200 PNG)
├── tags[] (infrastructure, services, analytics, consumer)
├── facilitator? (optional - verifiable role)
│   ├── endpoint
│   ├── networks[]
│   └── x402scan (slug for stats page)
└── token? (optional)
    ├── network + contract_address
    └── coingecko_id (if listed)
```

## Project

Top-level entity. Every listing is a project.

```yaml
id: primer
name: Primer Systems
description: x402 facilitator and WordPress plugin
website: https://primer.systems
docs: https://docs.primer.systems
twitter: primersystems
telegram: Primer_HQ
discord: null
farcaster: null
youtube: null
reddit: null
medium: primersystems
github: primersystems
logo: assets/logos/primer.png
tags:
  - infrastructure
  - consumer
facilitator:
  endpoint: "https://api.primer.systems/x402"
  networks:
    - base
  x402scan: primer
token:
  symbol: PR
  name: Primer
  network: base
  contract_address: "0x2357110F5F0c5344EEf75966500c75116A4aA153"
  coingecko_id: kilt-protocol-3  # API ID for price data
  coingecko_slug: primer         # URL slug (if different)
```

## Project Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | yes | Lowercase, hyphenated identifier |
| `name` | yes | Display name |
| `description` | yes | Brief description (under 100 chars) |
| `website` | yes | Primary URL |
| `docs` | no | Documentation URL |
| `twitter` | no | Handle without @ |
| `telegram` | no | Handle or full URL |
| `discord` | no | Invite URL |
| `farcaster` | no | Warpcast handle |
| `youtube` | no | Channel URL |
| `reddit` | no | Subreddit name or full URL |
| `medium` | no | Handle (without @) or full URL |
| `github` | no | `org/repo` or `username` format |
| `logo` | no | Path to logo file |
| `tags` | yes | At least one tag |
| `facilitator` | no | Facilitator details if applicable |
| `token` | no | Token details if applicable |

## Tags

Tags are self-assessed product categories. Use at least one. Multiple tags are allowed.

**Allowed tags (choose from these only):**

| Tag | Description | Examples |
|-----|-------------|----------|
| `infrastructure` | Core building blocks for x402 | SDKs, libraries, facilitator tooling, node providers |
| `services` | Selling access via x402 | APIs, content paywalls, data feeds, AI endpoints |
| `analytics` | Data and visibility | Explorers, dashboards, indexers |
| `consumer` | End-user applications | Wallets, browser extensions, desktop apps |

## Facilitator (optional)

Facilitators process x402 payments. This is a verifiable role - the endpoint can be tested. Projects with a `facilitator` object get the FACILITATOR badge.

| Field | Required | Description |
|-------|----------|-------------|
| `endpoint` | yes | The facilitator API endpoint URL |
| `networks` | yes | Array of supported networks (`base`, `ethereum`, etc.) |
| `x402scan` | no | Slug for x402scan.com/facilitator/{slug} stats page |

## Token (optional)

| Field | Required | Description |
|-------|----------|-------------|
| `symbol` | yes | Token symbol (e.g., PR) |
| `name` | yes | Full token name |
| `network` | yes | `base`, `ethereum`, `solana`, `polygon` |
| `contract_address` | yes | On-chain address |
| `coingecko_id` | no | CG API ID for price data (may differ from URL) |
| `coingecko_slug` | no | CG URL slug if different from API ID |

**Note:** CoinGecko's API ID and URL slug can differ. For example, Primer's API ID is `kilt-protocol-3` but the URL is `coingecko.com/en/coins/primer`. Use `coingecko_id` for API calls and `coingecko_slug` for links.

## Logos

| Spec | Value |
|------|-------|
| Format | PNG, transparent background |
| Size | 200x200 px |
| Location | `assets/logos/{id}.png` |
| Fallback | Auto-generated initials circle |

Logos are scaled down to 32x32 in the table row.

## Price Data Sources

### Strategy
```
Has coingecko_id?
├── Yes → CoinGecko API (preferred)
│         - Aggregates multiple markets
│         - More reliable price
└── No  → DexScreener API (fallback)
          - Always works for DEX tokens
          - Derived from network + contract_address
```

### CoinGecko API
```
GET https://api.coingecko.com/api/v3/simple/price
  ?ids=primer
  &vs_currencies=usd
  &include_24hr_change=true
  &include_market_cap=true
  &include_24hr_vol=true
```
- Free tier: 10-30 calls/min
- Use when token is listed

### DexScreener API
```
GET https://api.dexscreener.com/latest/dex/tokens/{contract_address}
```
- Always available for any DEX-traded token
- Returns price, volume, liquidity
- Use when no CoinGecko listing

### Facilitator Data
- Link to x402scan.com (don't rebuild indexer)
- Future: Pull from x402scan API if available

## MVP Scope

### Phase 1: Token Metrics (NOW)
- [x] Static project data in `data/projects.json`
- [ ] Client-side price fetch (CG + DexScreener fallback)
- [ ] Display: price, 24h change, mcap, volume
- [ ] Sort by market cap

### Phase 2: Polish
- [ ] Tag filtering
- [ ] Project logos
- [ ] Mobile responsive

### Phase 3: Growth
- [ ] Project detail pages
- [ ] GitHub PR submission template
- [ ] Facilitator stats from x402scan

## File Structure

```
x402view/
├── index.html
├── data/
│   └── projects.json
├── assets/
│   ├── logo.png          # x402view logo
│   └── logos/            # Project logos
│       └── primer.png
├── README.md
└── SCHEMA.md
```

## Deployment

```bash
vercel --prod
```

Static site, no build step. Client-side JS fetches prices.
