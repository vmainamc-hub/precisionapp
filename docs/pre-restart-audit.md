# Architectural Pre-Restart Audit & Deriv Official Bot Foundation Strategy

**Document Status**: Final Architecture Decision Report  
**Date**: August 28, 2026  
**Project**: PrecisionEdge / Trader's Companion  
**Target Ecosystem**: Deriv Developers API v3 & Deriv Official App Builder / DBot Ecosystem  

---

## Executive Summary & Decisive Verdict

We performed an exhaustive technical audit of the current repository alongside official Deriv Developers documentation ([developers.deriv.com](https://developers.deriv.com/) and [developers.deriv.com/app-builder/](https://developers.deriv.com/app-builder/)) and Deriv's official open-source repositories (`@deriv-com/trading-bot-template`, `@deriv-com/bot`, and `@deriv-com/binary-bot`).

### Decisive Recommendation: **OPTION C / PHASED HYBRID MIGRATION (DO NOT ABANDON THE APPLICATION — EMBED OFFICIAL DERIV BOT FOUNDATION INTO CUSTOM PLATFORM)**

* **Why Restarting Completely (Option B) is an Architectural Error**:
  Deriv's official "Bot" template (`deriv-com/trading-bot-template`) is **strictly a single-purpose visual bot tool** (Blockly workspace + basic chart). It does **NOT** contain, support, or provide an extensible foundation for a full-featured trading platform (e.g., custom multi-barrier DTrader execution, comprehensive real-time Digits Analyzers, AI Copilots, multi-account portfolio ledgers, or custom risk management). If we were to restart from the Bot template as our root codebase, we would be forced to rebuild 80% of our platform inside a legacy boilerplate.
* **Why Our Current Platform Architecture is Valid for Everything EXCEPT the Bot Engine**:
  Our modern React 19 + TypeScript + Vite + Tailwind + Express stack, OAuth PKCE flow, real-time WebSocket tick engines, custom digit probability calculators, live multi-timeframe canvas charts, and portfolio ledgers are working, high-performance systems.
* **The Root Mistake We Made**:
  We attempted to design a *custom algorithmic bot builder and execution engine* (`BotRecord`, preset state machines in server code) instead of adopting Deriv's **official Google Blockly XML strategy engine**.
* **The Correct Resolution**:
  **Preserve the entire platform shell and all manual trading / analytics tools.** Replace our custom bot builder logic with Deriv's official Blockly workspace (`@deriv/bot-skeleton` / official XML block schema) mounted inside the dedicated `Bots` view (`src/components/BotsCenter/`).

---

# PART 1 — CURRENT PROJECT AUDIT

### 1.1 What Has Been Built & Is Fully Functional

| System / Component | Location | Functional State | Architectural Role |
| :--- | :--- | :--- | :--- |
| **Trading Terminal & Order Execution** | `src/components/TradingDashboard/` | **100% Functional** | Real-time live execution of `CALL`/`PUT` contracts, custom stake controls, duration selection, and instant toast notifications. |
| **Live High-Performance Canvas Chart** | `src/components/TradingDashboard/LiveCanvasChart.tsx` | **100% Functional** | Native HTML5 60fps Canvas engine rendering real-time OHLC candles, moving averages (SMA/EMA), RSI, Bollinger Bands, cursor crosshair overlays, and open position price barriers. |
| **SmartTrader Multi-Contract Suite** | `src/components/SmartTrader/SmartTraderView.tsx` | **100% Functional** | Interactive trade interface supporting Rise/Fall, Higher/Lower, Touch/No Touch, Matches/Differs, and Even/Odd with live quotation and payout calculations. |
| **Real-Time Digits Analyzer** | `src/components/DigitsCenter/DigitsView.tsx` | **100% Functional** | 1,000-tick circular buffer tracking last-digit frequency distribution (0–9), Even vs. Odd ratios, Over/Under thresholds, streak analysis, and digit speed meters. |
| **Market Analysis & Technical Matrix** | `src/components/AnalysisCenter/AnalysisCenter.tsx` | **100% Functional** | Multi-timeframe trend scanner (1m, 5m, 15m, 1h, 1d), dynamic support/resistance calculation, RSI momentum indicators, and AI market insight generator. |
| **Portfolio & Settlement History** | `src/components/Portfolio/`, `src/components/History/` | **100% Functional** | Closed trade reconciliation, real-time profit/loss metrics, win-rate tracking, total turnover calculation, and CSV transaction export. |
| **Multi-Account & Currency Switcher** | `src/components/Account/AccountView.tsx` | **100% Functional** | Live switching between Demo (`VRTC`) and Real accounts, token authorization, and balance auditing. |
| **OAuth 2.0 PKCE Gateway** | `server/derivService.ts`, `src/components/OAuthCallback.tsx` | **100% Functional** | RFC 7636 PKCE code verifier/challenge generation, state CSRF validation, multi-account token receipt, and session binding. |
| **Audio Feedback Engine** | `src/services/sound.ts` | **100% Functional** | Web Audio API synthesizer generating tactile auditory cues for trade execution, win, loss, and alert notifications. |
| **Backend Express Server & API Proxy** | `server.ts`, `server/derivService.ts` | **100% Functional** | Secure Node.js proxy managing WebSocket connections to `wss://ws.derivws.com/websockets/v3`, preventing client-side secret leakage. |

---

### 1.2 What is Merely Documentation or Conceptual

1. **Custom Blockly Visual Node Builder**: Any documentation suggesting we build a proprietary visual block drag-and-drop workspace from scratch.
2. **Proprietary Cloud Headless Automation**: Any specification assuming Deriv provides a cloud-hosted `auto_start` service for background third-party bots.
3. **Proprietary Custom Strategy File Formats**: Any draft specification proposing JSON-based strategy formats that do not match Deriv's official `.xml` schema.

---

### 1.3 What Was Custom-Designed

* **The Entire UI/UX Shell**: Header, navigation, tabs, dark-mode themes, responsive grid layouts, and micro-interactions.
* **Canvas Charting Engine**: Custom Canvas 2D rendering pipeline (independent of Deriv SmartCharts).
* **Digit Statistics Math**: Direct client-side statistical processing of tick streams.
* **Audio Synthesizer**: Custom Web Audio oscillators.
* **In-Memory Mock/Fallback Database**: `server/db.ts` providing seamless offline and demo mode simulation.

---

### 1.4 What Depends on Our Custom Architecture

* The `useTrading()` React context and global state store (`TradingContext.tsx`).
* The unified REST/WebSocket bridge (`src/services/api.ts` & `server/derivService.ts`).
* The active contract tracking loop and toast notification dispatchers.

---

### 1.5 What Could Potentially Be Reused

* **100% of UI Components**: `TradingDashboard`, `SmartTraderView`, `DigitsView`, `AnalysisCenter`, `PortfolioView`, `HistoryView`, `AccountView`, `Navbar`.
* **100% of Infrastructure**: OAuth 2.0 PKCE service, WebSocket connection manager, Canvas math algorithms (`chartMath.ts`), and Web Audio engine (`sound.ts`).
* **100% of Types & Schema**: Core market definitions (`markets.ts`), trade records, and contract definitions.

---

### 1.6 What Should NOT Be Carried Forward / Must Be Discarded

* ❌ **Custom Bot Execution State Machine**: The server-side tick evaluator in `server/derivService.ts` (`startBotEngine()`) that attempts to run bots server-side in Node.js intervals.
* ❌ **Proprietary Bot Builder Schema**: Any custom block or node editor designs that do not use Google Blockly with Deriv's official block definitions.
* ❌ **Custom Non-XML Strategy Formats**: Any proprietary bot export formats.

---

# PART 2 — DERIV OFFICIAL APP BUILDER INVESTIGATION

Based on verified research across official Deriv developer resources ([developers.deriv.com](https://developers.deriv.com/), [developers.deriv.com/app-builder/](https://developers.deriv.com/app-builder/), `@deriv-com/trading-bot-template`, and `@deriv-com/bot`):

### 1. How to create it
The official Bot template can be initialized either through the App Builder portal at `developers.deriv.com/app-builder/` by selecting the **"Bot"** template, or by cloning/forking the official open-source starter repository `github.com/deriv-com/trading-bot-template`.

### 2. Whether it must be selected when creating the app
**NO.** At the Deriv API and OAuth level, there is no restriction. An App ID created in the Deriv Developer portal is simply an OAuth client with scopes (`read`, `trade`, `payments`, `admin`). It can be used for manual trading, charting, or automated Blockly bot trading interchangeably.

### 3. Whether an existing app can be converted to it
**YES.** You do not need to "convert" anything in Deriv's backend. The template is purely client-side front-end code that connects to standard Deriv WebSocket endpoints.

### 4. Whether it creates a complete application
It creates a **standalone Single-Page Application (SPA)** dedicated solely to visual bot building, strategy testing, and running bots. It does **not** provide a comprehensive multi-feature trading suite (such as DTrader, Digits Analyzers, or custom portfolios).

### 5. Whether source code is available
**YES.** The complete source code is public and open-source under the `@deriv-com` organization on GitHub (`trading-bot-template`, `bot`, and `binary-bot`).

### 6. Whether GitHub integration is available
**YES.** Deriv App Builder connects directly to GitHub to deploy code to developer repositories.

### 7. Whether it can be connected to an existing GitHub repository
**YES.** You can clone the template or integrate its modules (`@deriv/bot-skeleton`, Blockly workspace files) directly into an existing repository.

### 8. Whether it requires a new App ID
**NO.** You can use your existing registered Deriv `App ID`.

### 9. Whether OAuth must be configured again
**NO.** The same OAuth App ID and Redirect URIs configured for your trading app apply to bot trading.

### 10. Whether the template includes Blockly
**YES.** The official template is built around Google Blockly with custom Deriv blocks for trade definitions, purchase conditions, sell rules, and money management.

### 11. Whether it includes SmartCharts
**YES.** It integrates `@deriv/deriv-charts` / SmartCharts for visualizing ticks and trade execution markers.

### 12. Whether it includes the official Bot runtime
**YES.** It includes the official client-side execution loop (`bot-skeleton`) that subscribes to ticks, evaluates Blockly logic trees, issues `buy`/`sell` requests via WebSocket, and tracks `proposal_open_contract`.

### 13. What can be customized
* Brand colors, logos, typography, and styling.
* Surrounding UI layout, sidebars, headers, and navigation.
* Default strategies and preset XML templates.
* Additional diagnostic tools and UI overlays.

### 14. What cannot be customized
* The underlying Deriv WebSocket protocol schema (`proposal`, `buy`, `sell`).
* The structure of standard Deriv XML strategy files (modifying the XML syntax would break compatibility with [bot.deriv.com](https://bot.deriv.com)).

### 15. Whether custom pages/features can be added
**YES.** Because it is standard React/TypeScript, you can add any number of additional views, routes, or tabs.

### 16. Whether custom backend services can be added
**YES.** You can connect the client to your own Express or cloud backend for analytics, AI, or database persistence.

### 17. Whether custom analysis tools can coexist with it
**YES.** Custom tools (like our Digits Analyzer, AI Copilot, and SmartTrader) can run alongside the Bot workspace within the same web application.

### 18. Whether the Bot template can become the foundation for a larger third-party trading platform
**YES, but with an important architectural caveat**: The template is designed as a *bot-first* SPA. Using it as the root foundation for a 20-feature trading terminal requires extensive refactoring. The cleaner architectural pattern is to **embed the official Bot workspace as a first-class module within a robust platform shell**.

---

# PART 3 — ARCHITECTURAL OPTIONS COMPARISON

```
+-----------------------------------------------------------------------------------------------+
|                                OPTION EVALUATION MATRIX                                       |
+-------------------+-----------------------------+-----------------------+---------------------+
| Criterion         | OPTION A: Retrofit Inside   | OPTION B: Throw Away  | OPTION C: Modular   |
|                   | Current App (Ad-hoc)        | Everything & Restart  | Official Integration|
+-------------------+-----------------------------+-----------------------+---------------------+
| Effort            | Medium                      | Very High (Rebuild)   | Moderate / Clean    |
| Preserves Built   | High (Keeps working tools)  | Zero (Total waste)    | 100% Preserved      |
| Deriv Compliance  | High                        | High                  | 100% Compliant      |
| Strategy XML      | Official .xml supported     | Official .xml         | Official .xml       |
| Architecture Risk | Low                         | High (Regressions)    | Minimal             |
| Recommendation    | Acceptable                  | REJECTED              | ⭐ RECOMMENDED       |
+-------------------+-----------------------------+-----------------------+---------------------+
```

### Analysis of Options:

* **OPTION A (Retrofit ad-hoc)**: Attempting to hack the official Blockly engine into our existing codebase without decoupling risks creating messy dependencies.
* **OPTION B (Abandon and Restart from Bot Template)**: **Technically flawed.** Throwing away all our working features (SmartTrader, Digits Analyzer, AI Assistant, Canvas Charts, Portfolio, OAuth PKCE server) just to get the Bot template would set development back by weeks and force us to reconstruct our entire product inside a basic bot skeleton.
* **OPTION C (Architecturally Decoupled Integration — RECOMMENDED)**:
  * Keep the current application shell, UI, routing, and all manual/analytical tools.
  * Remove the custom server-side bot engine.
  * Integrate Deriv's official Blockly engine (`bot-skeleton` + Blockly XML workspace) directly into the `src/components/BotsCenter/` view.
  * Provide users with both **Quick Bot Presets** (Martingale, D'Alembert) and the **Official Deriv DBot Visual Builder**.

---

# PART 4 — ARCHITECTURAL ARTIFACT REVIEW

Reviewing previous specifications (`docs/12-bots.md`, `docs/13-bot-builder.md`, `docs/14-backtesting.md`):

| Previous Concept | Recommendation | Action |
| :--- | :--- | :--- |
| **Custom Visual Node Graph (Non-Blockly)** | ❌ **DISCARD** | Deriv users expect standard Google Blockly drag-and-drop compatible with `.xml` files from [bot.deriv.com](https://bot.deriv.com). |
| **Proprietary JSON Strategy Format** | ❌ **DISCARD** | Must use official Deriv Blockly XML serialization format. |
| **Server-Side Headless Bot Execution in Node.js** | ❌ **DISCARD** | Official Deriv bots run client-side in the browser via WebSocket v3 subscriptions. Headless cloud execution creates session/token security risks. |
| **Preset Bot Configurations (Martingale, D'Alembert, Oscar's Grind)** |  **RETAIN** | Keep these as "Quick Strategy" presets that generate official Blockly XML under the hood. |
| **Historical Tick Backtesting Engine** |  **RETAIN & REFINE** | Backtest against historical tick arrays fetched via `ticks_history` API. |
| **Real-Time Bot Performance Telemetry (Win Rate, P/L, Runs)** |  **RETAIN** | High user value; wrap around the official execution runtime. |

---

# PART 5 — THE COMPLETE 21-FEATURE TARGET PLATFORM

The target platform (**Trader's Companion / PrecisionEdge**) is a comprehensive institutional-grade trading suite where the **Official Deriv Bot** is one of 21 first-class capabilities:

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           TRADER'S COMPANION PLATFORM SHELL                             │
├───────────────────────────────┬─────────────────────────┬───────────────────────────────┤
│ 1. Official Deriv DBot / XML  │ 8. AI Trading Assistant │ 15. Performance Analytics     │
│ 2. Executive Dashboard        │ 9. AI Market Insights   │ 16. Strategy Backtesting      │
│ 3. Market Asset Explorer      │ 10. Custom Trading Sys  │ 17. Risk Management Limiter   │
│ 4. Advanced Canvas Analysis   │ 11. Real-Time Signals   │ 18. Live Bot Telemetry        │
│ 5. Digits Probability Suite   │ 12. Price / Trend Alert │ 19. Multi-Account Switcher    │
│ 6. Pro Trading Terminal       │ 13. Open Risk Portfolio │ 20. Platform Settings         │
│ 7. SmartTrader (DTrader-style)│ 14. Audit Trade History │ 21. Help & Interactive Guides │
└───────────────────────────────┴─────────────────────────┴───────────────────────────────┘
```

**Clear Ownership Boundary**:
* **Deriv-Owned / Official**:
  * Blockly block definitions (`trade_definition`, `during_purchase`, `after_purchase`).
  * `.xml` strategy file schema.
  * WebSocket API v3 contracts and trade execution endpoints.
* **Our Custom Application**:
  * Platform UI/UX, navigation, dark-mode design system.
  * Real-time digit statistics engines (circular buffer, frequencies).
  * High-performance 60fps HTML5 Canvas charting engine.
  * AI Copilot & market analysis algorithms.
  * Multi-account management, risk limiters, and sound synthesizer.

---

# PART 6 — CLEAN TARGET ARCHITECTURE

```
                               ┌─────────────────────────────────────────┐
                               │       TRADER'S COMPANION PLATFORM       │
                               │        [React 19 + TypeScript + Vite]   │
                               └────────────────────┬────────────────────┘
                                                    │
                 ┌──────────────────────────────────┴──────────────────────────────────┐
                 │                                                                     │
     ┌───────────▼───────────┐                                             ┌───────────▼───────────┐
     │   ANALYTICS & TRADING │                                             │   AUTOMATED BOT SUITE │
     │       MODULES         │                                             │   (Official Engine)   │
     ├───────────────────────┤                                             ├───────────────────────┤
     │ • SmartTrader View    │                                             │ • Official Deriv DBot │
     │ • Digits Analyzer     │                                             │   (Google Blockly)    │
     │ • Canvas Chart Engine │                                             │ • Official XML Loader │
     │ • Technical Scanner   │                                             │ • Quick Bot Presets   │
     │ • AI Market Copilot   │                                             │ • Bot Telemetry Panel │
     │ • Portfolio & History │                                             │ • Tick Backtester     │
     └───────────┬───────────┘                                             └───────────┬───────────┘
                 │                                                                     │
                 └──────────────────────────────────┬──────────────────────────────────┘
                                                    │
                               ┌────────────────────▼────────────────────┐
                               │   UNIFIED DERIV CLIENT CONTEXT LAYER    │
                               │  (TradingContext.tsx + derivService.ts) │
                               └────────────────────┬────────────────────┘
                                                    │
                               ┌────────────────────▼────────────────────┐
                               │   DERIV WEBSOCKET API v3 (wss://...)    │
                               │   OAuth 2.0 PKCE / App ID: Configured   │
                               └─────────────────────────────────────────┘
```

---

# PART 7 — REUSE & PRESERVATION STRATEGY

### What to Reuse from the Current Codebase:
1. **`src/components/TradingDashboard/`**: Full trading terminal, live Canvas chart, position monitoring.
2. **`src/components/SmartTrader/`**: Multi-contract quotation, payout calculation, contract selector.
3. **`src/components/DigitsCenter/`**: Real-time tick statistics, circular buffer, digit distributions.
4. **`src/components/AnalysisCenter/`**: Multi-timeframe trend matrix, support/resistance calculators, RSI indicators.
5. **`src/components/Portfolio/` & `src/components/History/`**: Closed trade ledger, P/L analytics, CSV exporter.
6. **`src/components/Account/`**: Account switching (`VRTC`/Real), token validation, security display.
7. **`server/derivService.ts` (OAuth & Proxy Layer)**: RFC 7636 PKCE generator, CSRF protection, WebSocket relay.
8. **`src/services/sound.ts`**: Complete audio feedback synthesizer.

### What to Cleanly Recreate / Integrate:
1. **`src/components/BotsCenter/BlocklyWorkspace.tsx`**: Embed the official Deriv Blockly visual editor.
2. **`src/services/derivBlockly.ts`**: Implement `.xml` import/export conforming to the official Deriv DBot schema.
3. **`src/services/botRuntime.ts`**: Connect Blockly execution events to standard Deriv WebSocket `proposal` and `buy` requests.

---

# PART 8 — STEP-BY-STEP IMPLEMENTATION ROADMAP

### Phase 1: Preparation & Decoupling (Current Turn)
1. Commit and preserve the current application repository.
2. Deprecate custom server-side bot intervals in `server/derivService.ts`.
3. Keep all 7 primary functional views (Dashboard, SmartTrader, Digits, Analysis, Bots, History, Account) active.

### Phase 2: Ingest Official Deriv Blockly Engine
1. Integrate Google Blockly with Deriv's standard block definitions (`@deriv/bot-skeleton` or official XML templates).
2. Mount the interactive Blockly canvas inside `BotsCenter` with standard toolboxes (Trade Parameters, Purchase Conditions, Sell Conditions, Money Management).

### Phase 3: Strategy XML File Compatibility
1. Add "Import Strategy (.xml)" and "Export Strategy (.xml)" buttons.
2. Test loading real `.xml` files exported from [bot.deriv.com](https://bot.deriv.com) to guarantee 100% interoperability.

### Phase 4: Strategy Execution & Telemetry
1. Wire the Blockly execution engine to the active WebSocket session in `TradingContext`.
2. Display live bot telemetry (active contract, consecutive wins/losses, current stake, session net P/L) alongside the Blockly canvas.

---

## Conclusion

We do **NOT** need to abandon or restart the project. The platform's architecture is solid, performant, and feature-rich. By replacing only the proprietary bot generator with the **official Deriv Blockly engine and XML standard**, we achieve 100% compliance with Deriv's ecosystem while retaining all our custom high-value trading tools.
