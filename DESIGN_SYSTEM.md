# DESIGN SYSTEM CONTRACT: SmartMoney US - 2026 Tax & Wealth Calculators (SP #3)

> Modeled on high-trust US financial editorial leaders (SmartAsset, NerdWallet, Bankrate) and locked to `ui-ux-pro-max` + `anti-slop` + `frontend-ui-engineering`.

## 1. Brand & Visual Identity
- **Product Name:** `SmartMoney US` (Sub-label: `2026 Tax & Wealth Calculators`)
- **Visual Direction:** Swiss Editorial Fintech. Default **Light Mode** for maximum financial credibility and reading clarity, with full **Dark Mode** parity.
- **Core Layout Pattern:** Two-column split workspace on desktop (Left: structured inputs with paired sliders + collapsible Advanced Deductions; Right: sticky Hero Result Card with live SVG donut/bar charts and contextual next-step cards).

## 2. Color Tokens (WCAG AA Verified in Both Themes)
### Light Theme (Default: Editorial Wealth)
- `--bg-canvas`: `#F4F6F8`
- `--bg-surface`: `#FFFFFF`
- `--bg-elevated`: `#EDF1F5`
- `--border-subtle`: `#DCE3EC`
- `--border-strong`: `#B7C4D4`
- `--text-primary`: `#0B132B`
- `--text-secondary`: `#3B4A62`
- `--text-muted`: `#5B6B82`
- `--accent-emerald`: `#0F766E` (Primary actions, Take-Home Net Pay, Investment Growth)
- `--accent-navy`: `#1D4ED8` (Federal Tax, Principal, Secondary highlights)
- `--accent-amber`: `#B45309` (State Tax, Interest Cost, Warnings)
- `--accent-slate`: `#475569` (FICA, Insurance/HOA)

### Dark Theme (Midnight Ledger)
- `--bg-canvas`: `#0A0F1A`
- `--bg-surface`: `#111827`
- `--bg-elevated`: `#1B2436`
- `--border-subtle`: `#26334A`
- `--border-strong`: `#3A4C6B`
- `--text-primary`: `#F3F6FA`
- `--text-secondary`: `#A8B6CC`
- `--text-muted`: `#8294B0`
- `--accent-emerald`: `#14B8A6`
- `--accent-navy`: `#60A5FA`
- `--accent-amber`: `#F59E0B`
- `--accent-slate`: `#94A3B8`

## 3. Typography
- **Editorial Headings:** `'Newsreader', Georgia, serif` (Signals authoritative US financial journalism).
- **UI, Labels, Inputs & Numbers:** `'IBM Plex Sans', system-ui, -apple-system, sans-serif` with `font-variant-numeric: tabular-nums`.

## 4. Compliance & Anti-Slop Locks
- Real 2026 IRS Federal progressive tax brackets, FICA caps, and all 50 US states + DC tax structures.
- Transparent educational disclaimer (required for US AdSense & financial affiliate approval).
- Zero em dashes (`—`), zero fabricated user reviews or fake APY guarantees, zero dead buttons, `>= 44px` tap targets, full keyboard accessibility.
