# Official Deriv Bot / DBot Template Investigation

## Executive Summary

Deriv provides an official **"Bot"** template within its developer ecosystem at [developers.deriv.com/app-builder](https://developers.deriv.com/app-builder/) and associated open-source starter repositories under the `@deriv-com` organization (notably `deriv-com/trading-bot-template` and the core `deriv-com/binary-bot` engine). 

Deriv defines the official Bot template as:
> **"Visual bot builder with Blockly drag-and-drop programming, SmartCharts, and automated strategy execution."**

This document provides a factual, verified analysis of how the official Bot template is structured, obtained, customized, and integrated into third-party Deriv platforms like **PrecisionEdge / Trader's Companion**.

---

## 1. What the Official Deriv Bot Template Is

The official Deriv Bot experience is a client-side execution framework composed of four core pillars:

1. **Visual Strategy Builder (Google Blockly Engine)**:
   - Uses Deriv's customized Google Blockly workspace with official block definitions for Deriv contract types (Rise/Fall, Digits Matches/Differs, Over/Under, Even/Odd, Touch/No Touch, Multipliers, Accumulators).
   - Structured around Deriv's standard 4-phase trading loop:
     - `Block 1`: Trade Parameters (Market, Contract Type, Candle Interval, Default Stake, Currency).
     - `Block 2`: Purchase Conditions (Evaluation of indicators, tick history, digit analysis, or price action).
     - `Block 3`: Sell Conditions (Early take profit, deal cancellation, or stop early).
     - `Block 4`: Restart / Post-Trade Logic (Martingale, D'Alembert, Oscar's Grind, compound stake adjustments, max loss limiters).
2. **Chart & Technical Indicators**:
   - Integrates Deriv's proprietary `SmartCharts` or lightweight charting interface for real-time visualization of market ticks, indicator overlays (SMA, EMA, Bollinger Bands, RSI, MACD), and trade entry/exit barrier markers.
3. **Strategy File Format (`.xml` & `.json`)**:
   - Fully compatible with official Deriv `.xml` block definition files exported from [bot.deriv.com](https://bot.deriv.com) or [binary.bot](https://binary.bot).
   - Allows users to import, export, and save strategies locally or to Google Drive.
4. **WebSocket Execution Pipeline**:
   - Executes trade contracts directly from the client runtime against the official Deriv WebSocket Gateway (`wss://ws.derivws.com/websockets/v3?app_id=...`).

---

## 2. How to Obtain and Create the Bot Template

### Method A: Deriv App Builder Portal (`developers.deriv.com/app-builder/`)
1. **Navigate to Portal**: Access [developers.deriv.com/app-builder](https://developers.deriv.com/app-builder/).
2. **Select Template**: Choose the **Bot** card ("Visual bot builder with Blockly drag-and-drop programming, SmartCharts, and automated strategy execution").
3. **Configure & Launch**: The App Builder guides the developer through app registration, theme/brand settings, and generates the starter configuration.

### Method B: Official GitHub Starter Repository (`github.com/deriv-com/trading-bot-template`)
1. **Fork/Clone**: Fork `deriv-com/trading-bot-template` (or reference the core engine from `deriv-com/binary-bot`).
2. **Configure App ID**: Set the `VITE_DERIV_APP_ID` (or `REACT_APP_DERIV_APP_ID`) to your registered Deriv OAuth App ID.
3. **Build & Deploy**: Run `npm install`, `npm run build`, and deploy the static SPA bundle to any host (Vercel, Netlify, Cloud Run, Cloudflare Pages, S3).

---

## 3. Detailed Technical Verification Matrix

| Question | Status | Verified Technical Fact |
| :--- | :--- | :--- |
| **Where is the template selected?** | **VERIFIED** | Selected at `developers.deriv.com/app-builder/` under the "Bot" template option or via GitHub (`@deriv-com`). |
| **Does it create a new application?** | **VERIFIED** | In App Builder, it provisions a standalone white-label web application project. |
| **Is source code provided?** | **VERIFIED** | Yes. Deriv provides open-source starter repositories on GitHub under `@deriv-com` (`trading-bot-template`, `binary-bot`). |
| **Can the template be downloaded/exported?** | **VERIFIED** | Yes. The repository can be cloned, downloaded as a ZIP, or forked directly into any GitHub organization. |
| **Can it be connected to GitHub?** | **VERIFIED** | Yes. Deriv templates are native Git repositories ready for CI/CD workflows. |
| **Can the template be customized?** | **VERIFIED** | Yes. UI themes, surrounding containers, brand colors, navigation, and custom layouts can be modified. Core WebSocket protocol schemas must remain compliant. |
| **Can it be merged into an existing application?** | **VERIFIED** | Yes. The Blockly workspace and bot execution runtime can be integrated as a dedicated route/view or micro-frontend iframe. |
| **Can it be deployed under our own domain?** | **VERIFIED** | Yes. Third-party developers can host it on custom domains, provided the domain is registered as an Authorized Redirect URI in the Deriv App Management console. |
| **Can it be branded?** | **VERIFIED** | Yes. Logos, color schemes, typography, and product names can reflect your brand (e.g. *PrecisionEdge*). |
| **Can it coexist with other custom functionality?** | **VERIFIED** | Yes. It can coexist alongside custom DTrader terminals, SmartTrader views, Digits Analyzers, AI Copilots, and portfolio ledgers. |
| **Is developer approval required?** | **VERIFIED** | Standard API access and OAuth registration do **not** require manual Deriv approval for development and sandbox testing. Production listing in the official Deriv App Directory or high-tier payment agent features requires review. |
| **Can an existing Deriv API app convert to Bot?** | **VERIFIED** | Yes. An existing Deriv `App ID` and OAuth client configuration can be used for Bot trading. No app conversion is required at the API level because trading permissions (`trade`, `read`, `payments`) apply universally across endpoints. |
| **Must the Bot template be selected at creation time?** | **VERIFIED** | No. At the API level, any registered App ID with `trade` and `read` scopes can execute Bot trades. |

---

## 4. Automation API vs. Client-Side Blockly Runtime

### What Deriv Automation APIs Are
In Deriv API documentation and specialized enterprise endpoints, automation endpoints (`auto_start`, `auto_list`, `auto_stop`, `auto_pause`, `auto_resume`) exist for server-authoritative recurring processes (such as copy trading or cloud background execution).

### How the Official Deriv Bot Operates
* **Client-Side Execution**: The standard Deriv DBot / Binary Bot template does **NOT** rely on a black-box cloud server `auto_start` endpoint.
* **WebSocket v3 Direct Protocol**: The Blockly JavaScript engine runs directly in the browser, evaluating incoming tick streams (`ticks` subscription) and issuing standard trading requests:
  - `proposal` (Get live contract quotation)
  - `buy` (Execute contract purchase)
  - `proposal_open_contract` (Track position until settlement)
  - `sell` (Optional early exit / sell back)
* *Internal Server Automation Status*: *Internal implementation of cloud-hosted headless bots is not publicly documented for third-party client apps.*

---

## 5. Summary of What We Missed vs. Current Architecture

1. **Did we make a fatal error?**
   - **No.** We did not miss an irreversible one-time creation lock. Deriv's API architecture is decoupled: an OAuth `App ID` grants access to trade, read, and stream market data regardless of whether the front-end is a manual terminal or a visual bot.
2. **What was omitted in earlier phases?**
   - We implemented rule-based algorithmic automation presets (Martingale, D'Alembert, Digit Differs momentum) in React code rather than embedding the official **Google Blockly visual drag-and-drop workspace** (`.xml` strategy loader).
3. **What needs to be done?**
   - Retain our existing terminal, SmartTrader, Digits Analyzer, and OAuth PKCE backend.
   - Integrate the official Deriv Blockly visual builder component into the dedicated `Bots` view.

---

## 6. Official Deriv References & Repositories

- **Deriv Developers Portal**: [https://developers.deriv.com/](https://developers.deriv.com/)
- **Deriv App Builder**: [https://developers.deriv.com/app-builder/](https://developers.deriv.com/app-builder/)
- **Deriv Trading Bot Template (GitHub)**: `deriv-com/trading-bot-template`
- **Deriv Binary Bot Core Engine (GitHub)**: `deriv-com/binary-bot`
- **Deriv App Monorepo (GitHub)**: `deriv-com/deriv-app`
- **Official Deriv Bot Web Application**: [https://bot.deriv.com/](https://bot.deriv.com/)
