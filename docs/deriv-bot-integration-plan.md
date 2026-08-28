# Deriv Bot / DBot Integration Plan

## Strategic Architecture Analysis

This document evaluates the architectural options for incorporating the official Deriv Bot / DBot visual Blockly trading experience into the **PrecisionEdge (Trader's Companion)** ecosystem.

---

## Evaluation of Integration Options

### OPTION A: Separate Standalone Bot Application
*Deploy the official Deriv Bot template as an independent web application (e.g., `bot.ourdomain.com`), distinct from the main trading terminal (`app.ourdomain.com`).*

* **Feasibility**: High.
* **Advantages**:
  * Zero code entanglement with custom React/TypeScript terminal.
  * Direct updates from Deriv upstream template repository.
* **Disadvantages**:
  * Fragmented user experience; users must navigate between two separate websites.
  * Redundant authentication / login prompts if sessions are not shared across subdomains.
* **OAuth & App ID Implications**:
  * Can use the same Deriv `App ID` if both domains are registered in Redirect URIs, or separate App IDs.
* **GitHub Implications**:
  * Requires maintaining two separate repositories.
* **Deployment Implications**:
  * Two separate build and hosting pipelines.
* **User Experience**: Moderate / disjointed.
* **Technical Risk**: Low.

---

### OPTION B: Bot Template as Primary Base, Porting Custom Systems In
*Adopt the official `deriv-com/trading-bot-template` as the root codebase, and port all custom SmartTrader, Digits Analyzer, AI Copilot, and Portfolio modules into it.*

* **Feasibility**: Low-to-Medium.
* **Advantages**:
  * Native foundation built around Blockly and SmartCharts from Day 1.
* **Disadvantages**:
  * High refactoring overhead: would require rewriting or retrofitting our extensive custom React components, Tailwind styling, full-stack Express server, and database schemas into Deriv's legacy template architecture.
  * Risk of regressions in custom features.
* **OAuth & App ID Implications**:
  * Uses single App ID.
* **GitHub Implications**:
  * Completely replaces the current repository structure.
* **Deployment Implications**:
  * Single deployment.
* **User Experience**: Consistent, but high development cost.
* **Technical Risk**: High (large architectural refactoring).

---

### OPTION C: Modular Integration (Embedded Official Bot Workspace in View) ⭐ [RECOMMENDED]
*Retain our full-stack architecture, navigation, and custom modules (SmartTrader, Digits Analyzer, AI Assistant, Portfolio, Account Management), and integrate the official Deriv Blockly visual builder component directly into the `Bots` view (`src/components/BotsCenter/`).*

* **Feasibility**: High.
* **Advantages**:
  * **Unified User Experience**: The user switches seamlessly between *Dashboard*, *SmartTrader*, *Digits*, *Bots*, *History*, and *Account* without leaving the app.
  * **Shared Authentication**: The active Deriv OAuth token and WebSocket connection session from `TradingContext` are passed directly to the Bot execution runtime.
  * **Zero Loss of Custom Value**: Preserves our 100% custom-built real-time digit analyzers, live canvas charts, telemetry, and backends.
  * **Full Strategy Compatibility**: Users can load official Deriv `.xml` strategy files created on Deriv Bot directly into the workspace.
* **Disadvantages**:
  * Requires maintaining the Blockly wrapper component within React.
* **OAuth & App ID Implications**:
  * Single App ID, zero authentication friction.
* **GitHub Implications**:
  * Single repository (`trader-s-companion`), clean version control.
* **Deployment Implications**:
  * Single unified build (`npm run build`) and deployment container.
* **User Experience**: Best-in-class, seamless, professional.
* **Technical Risk**: Low-to-Medium.

---

### OPTION D: Micro-Frontend / Sandboxed Secure Iframe Embed
*Embed the deployed official Bot instance inside a secure iframe within the `BotsCenter` view, synchronizing authentication via `postMessage`.*

* **Feasibility**: High.
* **Advantages**:
  * Total isolation of the Blockly workspace.
  * Easy to maintain.
* **Disadvantages**:
  * Deriv frame-busting headers or OAuth popup constraints may require specific sandbox permissions.
* **OAuth & App ID Implications**:
  * Requires passing session token safely or separate login within frame.
* **GitHub Implications**:
  * Two repositories or hosted endpoints.
* **Deployment Implications**:
  * Two hosting environments.
* **User Experience**: Good, but slight delay on iframe load.
* **Technical Risk**: Low.

---

## Comparison Matrix

| Criteria | Option A (Separate App) | Option B (Replace Root) | Option C (Modular Embed) ⭐ | Option D (Iframe MFE) |
| :--- | :--- | :--- | :--- | :--- |
| **UX Cohesion** | 🟡 Disjointed | 🟢 Unified | 🟢 **Unified (Best)** | 🟡 Good |
| **Effort to Implement** | 🟢 Low | 🔴 Very High | 🟢 **Moderate** | 🟢 Low |
| **Risk to Existing Code**| 🟢 Zero | 🔴 High | 🟢 **Very Low** | 🟢 Zero |
| **Strategy `.xml` Support**| 🟢 100% | 🟢 100% | 🟢 **100%** | 🟢 100% |
| **Single Deriv App ID** | 🟢 Yes | 🟢 Yes | 🟢 **Yes** | 🟢 Yes |
| **Maintenance Burden** | 🟡 Dual Repo | 🔴 High | 🟢 **Low (Single Repo)** | 🟡 Dual Hosting |

---

## Recommended Architecture Diagram

```
                              TRADER'S COMPANION (PrecisionEdge)
                                      [React + Vite + Tailwind]
                                                 │
      ┌──────────────────┬───────────────────────┼──────────────────────┬─────────────────┐
      │                  │                       │                      │                 │
  Dashboard         SmartTrader            Digits Analyzer         Account/Ledger    Bots Center
(Market Feed)    (Unified Execution)     (Tick Probabilities)     (Risk & History)        │
      │                  │                       │                      │                 │
      └──────────────────┴───────────────────────┼──────────────────────┴─────────────────┘
                                                 │
                                 Deriv OAuth PKCE & WebSocket Layer
                                 (Token: oauth_token, App ID: 1089)
                                                 │
                               ┌─────────────────┴─────────────────┐
                               │                                   │
                     Quick Bot Presets             OFFICIAL DERIV BOT MODULE
                 (Martingale / D'Alembert)          (Google Blockly Workspace)
                                                                   │
                                                      ├── Block 1: Trade Setup
                                                      ├── Block 2: Purchase Logic
                                                      ├── Block 3: Sell / Exit
                                                      └── Block 4: Restart Rules
                                                                   │
                                                      Official .XML Strategy Engine
```

---

## Implementation Roadmap (Option C)

1. **Step 1: Ingest Official Deriv Blockly Blocks & Toolboxes**
   - Import Deriv's standard trading blocks (contracts, ticks, indicators, mathematical operators, money management).
2. **Step 2: Mount Blockly Workspace in `BotsCenter`**
   - Provide a toggle between "Quick Strategies" (preset forms) and "Visual Blockly DBot" (full drag-and-drop workspace).
3. **Step 3: Strategy Import / Export Engine**
   - Implement `.xml` load/save handlers conforming to Deriv's official schema.
4. **Step 4: WebSocket Execution Hook**
   - Wire Blockly runtime events to execute live trades through our established `derivService.ts` and `TradingContext`.
