# Contributing to x402view

Add your project to the x402 ecosystem index.

## Requirements

Your project must:
- Build on, for, or meaningfully integrate, the x402 payment protocol
- Have a live website or public repository
- Be a legitimate project (no scams, rugs, or abandoned projects)

x402view will make editorial decisions as to the appropriateness of a project's inclusion.

## How to Submit

### 1. Fork and clone

```bash
git clone https://github.com/YOUR-USERNAME/x402view.git
cd x402view
```

### 2. Add your project to `data/projects.json`

```json
{
  "id": "your-project-id",
  "name": "Your Project Name",
  "description": "Brief description (under 100 chars)",
  "website": "https://yourproject.com",
  "docs": "https://docs.yourproject.com",
  "twitter": "yourhandle",
  "telegram": "your_telegram",
  "discord": "https://discord.gg/invite",
  "farcaster": "yourhandle",
  "youtube": "https://youtube.com/@yourchannel",
  "reddit": "yoursubreddit",
  "medium": "yourhandle",
  "github": "org/repo",
  "logo": "assets/logos/your-project-id.png",
  "tags": ["infrastructure"],
  "facilitator": null,
  "token": null
}
```

All social fields are optional - include what you have, use `null` for the rest.

**If your project is a facilitator:**

```json
"facilitator": {
  "endpoint": "https://api.yourproject.com/x402",
  "networks": ["base"],
  "x402scan": "your-x402scan-slug"
}
```

**If your project has a token:**

```json
"token": {
  "symbol": "TKN",
  "name": "Token Name",
  "network": "base",
  "contract_address": "0x...",
  "coingecko_id": "your-coingecko-id"
}
```

### 3. Add your logo (optional but recommended)

| Spec | Value |
|------|-------|
| Format | PNG with transparent background |
| Size | 200x200 pixels |
| Location | `assets/logos/{your-project-id}.png` |

If no logo is provided, initials will be auto-generated.

### 4. Open a Pull Request

Use the PR template checklist. We'll review and merge within a few days.

## Field Reference

### Project Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | yes | Lowercase, hyphenated (e.g., `my-project`) |
| `name` | yes | Display name |
| `description` | yes | Brief description, under 100 chars |
| `website` | yes | Primary URL |
| `docs` | no | Documentation URL |
| `twitter` | no | Handle without @ |
| `telegram` | no | Handle or full URL |
| `discord` | no | Invite URL |
| `farcaster` | no | Warpcast handle |
| `youtube` | no | Channel URL |
| `reddit` | no | Subreddit name or URL |
| `medium` | no | Handle or URL |
| `github` | no | `org/repo` format |
| `logo` | no | Path to logo file |
| `tags` | yes | At least one tag |
| `facilitator` | no | Facilitator details if applicable |
| `token` | no | Token details if applicable |

### Tags

Choose from these allowed tags (multiple allowed):

| Tag | Use when... | Examples |
|-----|-------------|----------|
| `infrastructure` | Core building blocks for x402 | SDKs, libraries, facilitator tooling, node providers |
| `services` | Selling access via x402 | APIs, content paywalls, data feeds, AI endpoints |
| `analytics` | Data and visibility | Explorers, dashboards, indexers |
| `consumer` | End-user applications | Wallets, browser extensions, desktop apps |

### Facilitator Fields

If your project processes x402 payments, include the `facilitator` object.

| Field | Required | Description |
|-------|----------|-------------|
| `endpoint` | yes | Your facilitator API endpoint URL |
| `networks` | yes | Array of supported networks (e.g., `["base"]`) |
| `x402scan` | no | Your slug on x402scan.com (for stats link) |

### Token Fields

| Field | Required | Description |
|-------|----------|-------------|
| `symbol` | yes | e.g., `PR` |
| `name` | yes | e.g., `Primer` |
| `network` | yes | `base`, `ethereum`, `solana`, `polygon` |
| `contract_address` | yes | On-chain address |
| `coingecko_id` | no | CoinGecko API ID (for price data) |
| `coingecko_slug` | no | CoinGecko URL slug (if different from API ID) |

**Finding your CoinGecko IDs:**

The API ID and URL slug can differ. For example, Primer uses:
- API ID: `kilt-protocol-3` (for fetching prices)
- URL slug: `primer` (for `coingecko.com/en/coins/primer`)

To find your API ID:
```
https://api.coingecko.com/api/v3/search?query=your-token
```

If your URL slug differs from the API ID, include both fields.

## Questions?

Open an issue or email [dev@primer.systems](mailto:dev@primer.systems).
