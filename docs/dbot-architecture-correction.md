# DBot Architecture Correction: Remove, Retain, Replace, Integrate

**Document Version**: 1.0.0  
**Date**: August 28, 2026  
**Status**: Architecture Governance Directive  
**Scope**: Bots Engine & Strategy Automation Alignment with Deriv Official Standard  

---

## 1. Executive Summary

This directive establishes the strict boundary between **PrecisionEdge / Trader's Companion** (our proprietary platform shell, manual trading interfaces, Canvas charting, digit statistics, AI copilots, and portfolio ledgers) and the **Deriv Official Bot Engine** (Blockly workspace, official block definitions, `.xml` strategy file standard, and JS-Interpreter runtime).

We have isolated our prior architectural mistake: attempting to construct a custom proprietary bot builder and server-side tick evaluator in Node.js instead of conforming to Deriv's client-side Google Blockly XML execution standard.

---

## 2. Architecture Matrix

### 2.1 REMOVE (What Must Disappear)

The following components and concepts from previous drafts (`docs/12-bots.md`, `docs/13-bot-builder.md`, `docs/14-backtesting.md`) are hereby marked for removal:

1. **Custom Server-Side Bot Execution Loops**:
   - Any server-side `setInterval` tick evaluators in `server.ts` or `server/derivService.ts` (`startBotEngine`).
   - Server-side headless bot state machines that simulate strategy ticks on Node.js without user browser presence.
2. **Proprietary Non-Blockly Node Graph Editors**:
   - Any proposed custom drag-and-drop node graph canvas (e.g. React Flow custom node editors) that does not output standard Deriv Blockly XML.
3. **Proprietary JSON Strategy Formats**:
   - Any custom JSON strategy schema (`{ strategyType: 'martingale', steps: [...] }`) designed as a replacement for Deriv's official `.xml` schema.
4. **Proprietary Strategy Compilers**:
   - Any home-grown DSL or custom AST parser attempting to execute bot logic outside of Deriv's official Blockly JavaScript generator and JS-Interpreter pipeline.
5. **Simulated/Fake Backtesters Claiming to be Deriv DBot Interpreters**:
   - Custom backtesting algorithms that pretend to simulate official DBot block behavior without running the actual block interpreter.

---

### 2.2 RETAIN (What Remains Useful & High-Value)

The following core modules are fully preserved and remain first-class platform capabilities:

1. **Core Platform Shell & Navigation**:
   - High-contrast responsive desktop/mobile UI shell (`Navbar.tsx`, `App.tsx`).
   - Theme system, notification toasts, and sound synthesizers (`src/services/sound.ts`).
2. **Manual & Pro Trading Engines**:
   - High-performance 60fps Canvas 2D Charting Engine (`LiveCanvasChart.tsx`).
   - Multi-contract SmartTrader Suite (`SmartTraderView.tsx`) supporting Rise/Fall, Touch/No-Touch, Matches/Differs, Even/Odd.
   - Pro Trading Terminal (`TradingDashboard.tsx`).
3. **Analytical & Quantitative Suites**:
   - Real-Time Digits Probability Suite (`DigitsView.tsx`) with 1,000-tick circular buffer and distribution algorithms.
   - Multi-Timeframe Technical Scanner (`AnalysisCenter.tsx`) with dynamic S/R levels and RSI momentum matrix.
   - AI Trading Copilot & Market Insights.
4. **Account, Security & Settlement**:
   - OAuth 2.0 PKCE Gateway & Session Manager (`server/derivService.ts`, `OAuthCallback.tsx`).
   - Multi-account switcher (Demo `VRTC` vs. Real USD/EUR accounts).
   - Portfolio tracker & Settlement Transaction Ledger (`PortfolioView.tsx`, `HistoryView.tsx`).
5. **Bot Management UI**:
   - Bot library view, search filters, strategy tags, run counters, and session P/L telemetry cards (`BotsCenter.tsx`).
   - Strategy presets (Martingale, D'Alembert, Oscar's Grind) presented as one-click templates that load valid Deriv Blockly XML.

---

### 2.3 REPLACE (What Should Be Replaced with Official Deriv Functionality)

| Previous Custom Concept | Official Deriv Replacement |
| :--- | :--- |
| Custom bot builder interface | **Deriv-compatible Google Blockly Workspace** with official Deriv block definitions (`trade_definition`, `before_purchase`, `during_purchase`, `after_purchase`). |
| Custom JSON strategy files | **Official Deriv Bot XML Schema (`.xml`)** supporting two-way import/export with [bot.deriv.com](https://bot.deriv.com). |
| Server-side bot runner | **Client-Side JS-Interpreter Engine** running in the browser over the active Deriv WebSocket v3 connection (`wss://ws.derivws.com/websockets/v3`). |
| Proprietary strategy execution hooks | **Official Deriv Lifecycle Blocks** (`purchase()`, `trade_again()`, `read_details()`, `check_direction()`). |

---

### 2.4 INTEGRATE (What Our Platform Builds Around the Official Bot System)

1. **Bot Studio Workspace**: Mount the official Deriv Blockly canvas inside `src/components/BotsCenter/`, allowing traders to visually edit, configure, drag, and connect blocks.
2. **Two-Way XML Strategy Bridge**:
   - **Import**: Load any `.xml` file exported from [bot.deriv.com](https://bot.deriv.com) directly into the workspace.
   - **Export**: Save the current workspace state as valid Deriv XML ready for execution on [bot.deriv.com](https://bot.deriv.com).
3. **Live Telemetry & Safety Cockpit**:
   - Real-time display of active bot contract, current streak, stake progression, total profit/loss, and trade count.
   - Integrated Emergency Kill Switch (`Stop Bot`) that unsubscribes from proposal streams and cancels pending actions.
4. **AI Strategy Transpiler / Generator**:
   - AI Assistant translates natural language prompts (e.g., *"Build an Even/Odd Martingale bot with 2.1x multiplier and $50 max loss"*) into valid Deriv Blockly XML structures.
5. **Backtesting & Historical Analytics**:
   - Backtest strategies using historical tick arrays obtained from Deriv's `ticks_history` API endpoint.

---

## 3. Implementation Guardrails

1. **Zero Mock Infrastructure**: Real WebSocket v3 calls to `wss://ws.derivws.com/websockets/v3`.
2. **Zero Proprietary Block Inventing**: Every block rendered in the workspace must map to an official Deriv block type recognized by the Deriv DBot standard.
3. **Clean Decoupling**: The Bot workspace communicates with the platform strictly via standardized events (`onStart`, `onStop`, `onTrade`, `onContractUpdate`, `onSaveXML`, `onLoadXML`).
