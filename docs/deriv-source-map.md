# Deriv Official Bot & Blockly Source Map

**Document Version**: 1.0.0  
**Date**: August 28, 2026  
**Audience**: PrecisionEdge / Trader's Companion Architecture Team  
**Scope**: Verification of official Deriv Bot, Blockly, XML, and Runtime dependencies  

---

## 1. Source Component Verification Table

| Component | Official Source | Public Status | Package / Repository | Can We Use It? | Integration Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Blockly Core** | Google Blockly |  **Public / Open Source** (Apache 2.0) | `blockly` (npm) |  **YES** (Direct npm dependency) | Official Google Blockly framework used by Deriv across Binary Bot and DBot. |
| **Deriv Block Definitions** | Deriv App DBot / Binary Bot |  **Public / Open Source** (Apache 2.0 / MIT) | `deriv-com/trading-bot-template`, `deriv-com/deriv-app/packages/bot-skeleton` |  **YES** (Standard block schema) | Defined to match the 4-root block structure (`trade_definition`, `before_purchase`, `during_purchase`, `after_purchase`) and action blocks (`purchase`, `trade_again`). |
| **Toolbox XML Configuration** | Deriv DBot Toolbox |  **Public / Open Source** | `bot-skeleton/src/scratch/xml/` |  **YES** (Standard categories) | Standard categories: Trade Parameters, Purchase Conditions, Sell Conditions, Restart / Money Management, Indicators, Logic, Math. |
| **Deriv JavaScript Generators** | Deriv Blockly Generators |  **Public / Open Source** | `bot-skeleton/src/scratch/generators/` |  **YES** (Blockly.JavaScript generators) | Transpiles Deriv blocks to JavaScript statements interacting with the Deriv WebSocket runtime. |
| **Strategy XML Serialization** | Deriv DBot XML Spec |  **Public Standard** | `bot.deriv.com` XML parser & serializer |  **YES** (Standard XML DOM) | Uses standard Blockly DOM serialization (`Blockly.Xml.workspaceToDom` / `domToWorkspace`) with Deriv namespaces. |
| **Sandboxed Runtime** | JS-Interpreter (Neil Fraser / Google) |  **Public / Open Source** (Apache 2.0) | `js-interpreter` (npm) |  **YES** (Direct npm dependency) | Sandboxes bot code execution inside browser thread; safely executes tick loops with native Deriv API wrappers. |
| **Deriv API & Execution** | Deriv WebSocket API v3 |  **Public API** | `wss://ws.derivws.com/websockets/v3` |  **YES** (Authenticated WebSocket) | Uses `proposal`, `buy`, `sell`, `proposal_open_contract` requests over user's authenticated session. |

---

## 2. Deriv Bot 4-Root Strategy Standard

Every official `.xml` strategy file created at [bot.deriv.com](https://bot.deriv.com) is structured into four mandatory root blocks:

1. **`trade_definition`**: Root block for initialization, asset/market selection, contract type, duration, and base stake.
2. **`before_purchase`**: Root block containing pre-purchase rules, indicator evaluations, and the `purchase` trigger block (`CALL` or `PUT`).
3. **`during_purchase`**: Optional/Root block for in-trade actions (e.g. sell early at market price).
4. **`after_purchase`**: Root block executed upon contract settlement for post-trade analysis, Martingale multipliers, and the `trade_again` action block.

---

## 3. Sandboxed Execution Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│ 1. VISUAL WORKSPACE                                         │
│    Google Blockly canvas with Deriv block definitions       │
└──────────────────────────────┬──────────────────────────────┘
                               │ Blockly.JavaScript.workspaceToCode()
┌──────────────────────────────▼──────────────────────────────┐
│ 2. GENERATED STRATEGY JAVASCRIPT                            │
│    Standard JavaScript with async Deriv native API calls    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Interpreter initialization & step loop
┌──────────────────────────────▼──────────────────────────────┐
│ 3. SANDBOXED JS-INTERPRETER                                 │
│    Step-by-step execution, pauses, and loop safety          │
└──────────────────────────────┬──────────────────────────────┘
                               │ Native bridge
┌──────────────────────────────▼──────────────────────────────┐
│ 4. DERIV WEBSOCKET API v3                                   │
│    `proposal` -> `buy` -> `proposal_open_contract`          │
└─────────────────────────────────────────────────────────────┘
```
