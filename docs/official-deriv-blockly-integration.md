# Official Deriv Blockly Integration Specification

**Document Status**: Official Technical Architecture Specification  
**Date**: August 28, 2026  
**Target Platform**: Trader's Companion / PrecisionEdge & Deriv Developers API v3  
**Reference Implementations**: [bot.deriv.com](https://bot.deriv.com), `github.com/deriv-com/trading-bot-template`, `github.com/deriv-com/deriv-app/packages/bot-skeleton`  

---

## Table of Contents

1. [Official Deriv Bot Architecture](#1-official-deriv-bot-architecture)
2. [Official Blockly Resources & Engine Stack](#2-official-blockly-resources--engine-stack)
3. [Official Repositories & Ecosystem](#3-official-repositories--ecosystem)
4. [Official Packages on npm](#4-official-packages-on-npm)
5. [Official XML Format & 4-Root Strategy Schema](#5-official-xml-format--4-root-strategy-schema)
6. [XML Import Process](#6-xml-import-process)
7. [XML Export Process](#7-xml-export-process)
8. [Workspace Integration & React Mounting](#8-workspace-integration--react-mounting)
9. [Runtime & JS-Interpreter Integration](#9-runtime--js-interpreter-integration)
10. [Execution Integration & WebSocket Lifecycle](#10-execution-integration--websocket-lifecycle)
11. [Authentication & Session Tokens](#11-authentication--session-tokens)
12. [WebSocket Protocol & API v3 Requirements](#12-websocket-protocol--api-v3-requirements)
13. [Account Requirements (Multi-Currency & Balance Sync)](#13-account-requirements)
14. [Demo vs. Real Account Separation](#14-demo-vs-real-account-separation)
15. [Security & Client-Side Execution Safety](#15-security--client-side-execution-safety)
16. [Licensing, Branding & Terms of Use](#16-licensing-branding--terms-of-use)
17. [Unsupported Assumptions (What NOT to Do)](#17-unsupported-assumptions)
18. [Final Recommended Architecture & Decisive Route](#18-final-recommended-architecture)

---

## 1. Official Deriv Bot Architecture

Deriv Bot (DBot) is an event-driven, visual algorithmic trading client. The official architecture consists of four distinct tiers:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        TIER 1: VISUAL WORKSPACE                         │
│   Google Blockly Canvas (custom blocks, flyouts, toolboxes, XML parser) │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ (Code Generator)
┌────────────────────────────────────▼────────────────────────────────────┐
│                       TIER 2: CODE TRANSPILER                           │
│   Blockly.JavaScript generator converts blocks into JavaScript AST      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ (Isolated Sandbox)
┌────────────────────────────────────▼────────────────────────────────────┐
│                    TIER 3: CLIENT-SIDE RUNTIME ENGINE                   │
│   JS-Interpreter (`js-interpreter`) manages bot state & async calls     │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ (WebSocket Frames)
┌────────────────────────────────────▼────────────────────────────────────┐
│                   TIER 4: DERIV WEBSOCKET API v3                        │
│   `wss://ws.derivws.com/websockets/v3?app_id={APP_ID}`                  │
└─────────────────────────────────────────────────────────────────────────┘
```

The strategy is evaluated **in the user's browser client**, not on a remote server. The client subscribes to live tick streams (`ticks` / `candles`), evaluates the user's Blockly logic on each incoming tick, and sends `proposal`, `buy`, `sell`, and `proposal_open_contract` requests to Deriv's WebSocket gateway.

---

## 2. Official Blockly Resources & Engine Stack

Deriv's visual builder is grounded on:
- **Google Blockly Core**: Google's open-source visual programming framework with customized themes, dark mode renderer, and category flyouts.
- **Custom Deriv Block Definitions**: Specialized domain blocks for binary options trading (market picker, contract type picker, candle intervals, barrier inputs, indicators like RSI/SMA/Bollinger Bands, and execution triggers).
- **Blockly JavaScript Generator (`Blockly.JavaScript`)**: Custom code generation rules assigned to each Deriv block type that emit JavaScript code representing strategy actions.
- **JS-Interpreter (`js-interpreter`)**: A pure-JavaScript sandbox created by Neil Fraser (Google) that executes user strategy code step-by-step with async pauses, preventing infinite loops and isolating execution from browser globals.

---

## 3. Official Repositories & Ecosystem

Deriv publishes and maintains the following official open-source repositories:

| Repository | GitHub URL | Description & Purpose |
| :--- | :--- | :--- |
| **`trading-bot-template`** | `github.com/deriv-com/trading-bot-template` | White-label starter application containing `bot-skeleton`, Blockly blocks, SmartCharts, and OAuth integration. |
| **`deriv-app`** | `github.com/deriv-com/deriv-app` | Deriv's primary monorepo containing `packages/bot-skeleton` (the core bot engine) and `packages/bot-web-ui` (the complete DBot UI). |
| **`deriv-api`** | `github.com/deriv-com/deriv-api` | Official Deriv API JavaScript/TypeScript client library with RxJS WebSocket observables. |
| **`binary-bot`** | `github.com/deriv-com/binary-bot` | Legacy Binary Bot application (predecessor to DBot) using Google Blockly. |

---

## 4. Official Packages on npm

Deriv publishes internal packages under the `@deriv` namespace on npm:
- `@deriv/bot-skeleton`: Core DBot controller, Blockly definitions, XML templates, indicators, and interpreter bindings.
- `@deriv/bot-web-ui`: Complete DBot React components (workspace, flyouts, strategy loader, transaction summary).
- `@deriv/deriv-api`: Official WebSocket API client.
- `@deriv/deriv-charts`: Deriv SmartCharts charting package.

> **Crucial Integration Finding**: While `@deriv/bot-skeleton` and `@deriv/bot-web-ui` exist on npm, they have hard dependencies on Deriv's specific Webpack bundler configurations, MobX stores, and React 17/18 peer dependencies. Directly installing `@deriv/bot-web-ui` in a standard Vite + Tailwind + React 19 application causes build conflicts. Therefore, the recommended method is importing the standardized **Deriv Blockly block definitions & XML transpilations** or embedding the **clean starter module**.

---

## 5. Official XML Format & 4-Root Strategy Schema

Every valid Deriv DBot strategy file (`.xml`) conforms to an official 4-root block structure. All 4 root blocks must exist on the workspace for a strategy to be valid:

```xml
<xml xmlns="http://www.w3.org/1999/xhtml" collection="false">
  <!-- 1. ROOT BLOCK: TRADE DEFINITION (Mandatory) -->
  <block type="trade_definition" id="trade_def_root" deletable="false" x="0" y="0">
    <statement name="TRADE_OPTIONS">
      <block type="trade_definition_market" id="market_block">
        <field name="MARKET_LIST">synthetic_index</field>
        <field name="SUBMARKET_LIST">random_index</field>
        <field name="SYMBOL_LIST">R_100</field>
        <next>
          <block type="trade_definition_tradetype" id="tradetype_block">
            <field name="TRADETYPECAT_LIST">callput</field>
            <field name="TRADETYPE_LIST">callput</field>
            <next>
              <block type="trade_definition_contracttype" id="contracttype_block">
                <field name="TYPE_LIST">both</field>
                <next>
                  <block type="trade_definition_candleinterval" id="candle_block">
                    <field name="CANDLEINTERVAL_LIST">60</field>
                    <next>
                      <block type="trade_definition_restartbuysell" id="restart_block">
                        <field name="TIME_MACHINE_ENABLED">FALSE</field>
                        <next>
                          <block type="trade_definition_restartonerror" id="error_block">
                            <field name="RESTARTONERROR">TRUE</field>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
    <statement name="INITIALIZATION">
      <!-- User variables, initial stake, stop loss, take profit -->
    </statement>
    <statement name="SUBMARKET">
      <!-- Duration, stake, barrier parameters -->
      <block type="trade_definition_tradeoptions" id="trade_options">
        <mutation has_check_action="false"></mutation>
        <field name="DURATIONTYPE_LIST">t</field>
        <value name="DURATION">
          <shadow type="math_number" id="dur_val">
            <field name="NUM">5</field>
          </shadow>
        </value>
        <value name="AMOUNT">
          <shadow type="math_number" id="stake_val">
            <field name="NUM">10</field>
          </shadow>
        </value>
      </block>
    </statement>
  </block>

  <!-- 2. ROOT BLOCK: BEFORE PURCHASE (Mandatory) -->
  <block type="before_purchase" id="before_purchase_root" deletable="false" x="0" y="450">
    <statement name="BEFORE_PURCHASE">
      <!-- Strategy Entry Conditions / Indicators / Purchase Call -->
      <block type="purchase" id="buy_call">
        <field name="PURCHASE_LIST">CALL</field>
      </block>
    </statement>
  </block>

  <!-- 3. ROOT BLOCK: DURING PURCHASE (Optional / Mandatory Root) -->
  <block type="during_purchase" id="during_purchase_root" deletable="false" x="0" y="700">
    <statement name="DURING_PURCHASE">
      <!-- Optional: Sell contract early if conditions met -->
    </statement>
  </block>

  <!-- 4. ROOT BLOCK: AFTER PURCHASE (Mandatory) -->
  <block type="after_purchase" id="after_purchase_root" deletable="false" x="0" y="850">
    <statement name="AFTER_PURCHASE">
      <!-- Post-Trade Evaluation (Martingale, Streak counters, Trade Again) -->
      <block type="trade_again" id="trade_again_action"></block>
    </statement>
  </block>
</xml>
```

---

## 6. XML Import Process

1. **File Selection**: Trader clicks **"Import Strategy"** or drags a `.xml` file onto the Bots workspace.
2. **DOM Parsing**: The browser parses the text into an XML DOM document using `DOMParser().parseFromString(xmlText, 'text/xml')`.
3. **Schema Validation**: Verify that the XML contains the required `<xml>` root element and contains at least `trade_definition`, `before_purchase`, and `after_purchase` block types.
4. **Workspace Hydration**: 
   - Clear existing workspace (`workspace.clear()`).
   - Load blocks into Blockly: `Blockly.Xml.domToWorkspace(xmlDom, workspace)`.
5. **UI Confirmation**: Notify the user with a success toast displaying the bot's strategy parameters (Market, Contract Type, Initial Stake).

---

## 7. XML Export Process

1. **Workspace Serialization**: Serialize the active Blockly workspace state:
   ```typescript
   const xmlDom = Blockly.Xml.workspaceToDom(workspace);
   const xmlText = Blockly.Xml.domToPrettyText(xmlDom);
   ```
2. **Deriv Header Injection**: Ensure the XML tag includes standard Deriv attributes (`xmlns="http://www.w3.org/1999/xhtml" collection="false"`).
3. **Blob Download**: Trigger a browser download of the `.xml` file (e.g. `MyDerivBot_Strategy.xml`).
4. **Interoperability Verification**: The exported `.xml` can be immediately opened in [bot.deriv.com](https://bot.deriv.com) without schema errors.

---

## 8. Workspace Integration & React Mounting

To mount the official Blockly workspace inside React:

```typescript
import React, { useEffect, useRef } from 'react';
import Blockly from 'blockly';
import { defineDerivBlocks } from './derivBlocks';
import { derivToolbox } from './derivToolbox';

export const DerivBlocklyWorkspace: React.FC<{
  xmlContent?: string;
  onWorkspaceChange?: (xml: string) => void;
}> = ({ xmlContent, onWorkspaceChange }) => {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  useEffect(() => {
    if (!blocklyDiv.current) return;

    // 1. Initialize Deriv Block Definitions
    defineDerivBlocks(Blockly);

    // 2. Inject Blockly Workspace
    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox: derivToolbox,
      grid: { spacing: 25, length: 3, colour: '#334155', snap: true },
      zoom: { controls: true, wheel: true, startScale: 0.9, maxScale: 2, minScale: 0.4 },
      trashcan: true,
      theme: Blockly.Themes.Dark, // Matches Trader's Companion dark styling
      renderer: 'geras',
    });

    workspaceRef.current = workspace;

    // 3. Load initial or default XML
    if (xmlContent) {
      const dom = Blockly.Xml.textToDom(xmlContent);
      Blockly.Xml.domToWorkspace(dom, workspace);
    }

    // 4. Listen to changes
    workspace.addChangeListener(() => {
      if (onWorkspaceChange) {
        const dom = Blockly.Xml.workspaceToDom(workspace);
        onWorkspaceChange(Blockly.Xml.domToPrettyText(dom));
      }
    });

    return () => {
      workspace.dispose();
    };
  }, []);

  return <div ref={blocklyDiv} className="w-full h-full min-h-[600px] rounded-xl overflow-hidden" />;
};
```

---

## 9. Runtime & JS-Interpreter Integration

Deriv's bot execution pipeline translates the visual workspace into sandboxed JavaScript:

1. **Code Generation**:
   ```typescript
   const generatedJs = Blockly.JavaScript.workspaceToCode(workspace);
   ```
2. **Interpreter Sandboxing**: Initialize `JS-Interpreter` with custom native bindings for Deriv asynchronous trading actions:
   ```typescript
   const initInterpreter = (interpreter: any, globalObject: any) => {
     // Native wrapper for purchasing a contract
     interpreter.setProperty(globalObject, 'derivPurchase', interpreter.createAsyncFunction(
       async (contractType: string, callback: () => void) => {
         await executeDerivPurchase(contractType);
         callback();
       }
     ));

     // Native wrapper for checking technical indicators
     interpreter.setProperty(globalObject, 'derivGetRSI', interpreter.createNativeFunction(
       (period: number) => calculateCurrentRSI(period)
     ));
   };
   ```
3. **Execution Loop**: The runtime steps through interpreter instructions on each tick update received from Deriv WebSocket API.

---

## 10. Execution Integration & WebSocket Lifecycle

The Bot lifecycle strictly adheres to Deriv's WebSocket message sequence:

```
Trader Clicks "Run Bot"
  │
  ├── 1. Send `authorize` { authorize: token }
  │       └── Receive `authorize` response (Account balance, currency, loginid)
  │
  ├── 2. Send `ticks` / `candles` { ticks: symbol, subscribe: 1 }
  │       └── Stream incoming ticks to Strategy Interpreter
  │
  ├── 3. Evaluate `before_purchase` Blockly logic on each tick
  │       └── When purchase condition evaluates to TRUE:
  │
  ├── 4. Send `proposal` { amount, basis: 'stake', contract_type, currency, duration, duration_unit, symbol }
  │       └── Receive `proposal` response { id: proposal_id, ask_price, payout }
  │
  ├── 5. Send `buy` { buy: proposal_id, price: ask_price }
  │       └── Receive `buy` response { contract_id, balance_after }
  │
  ├── 6. Send `proposal_open_contract` { contract_id, subscribe: 1 }
  │       └── Track live contract progress, barrier ticks, and final settlement
  │
  ├── 7. On Contract Settlement:
  │       └── Pass result (`profit`, `is_win`) into `after_purchase` block
  │       └── Evaluate Martingale / Stake adjustments
  │       └── If `trade_again()` is reached, repeat from Step 4.
```

---

## 11. Authentication & Session Tokens

* **OAuth 2.0 PKCE Flow**: User logs in via Trader's Companion OAuth gateway.
* **Token Receipt**: The client receives standard Deriv session tokens (`acct1`, `token1`, `cur1`).
* **WebSocket Headerless Auth**: The token is transmitted directly inside the WebSocket `authorize` request payload (`{ "authorize": "<TOKEN>" }`).
* **Multi-Account Switching**: When the trader switches from `VRTC` (Demo) to a Real account (`CR...`), the Bot runtime immediately halts any active strategy, resets execution state, and re-authorizes with the new account token.

---

## 12. WebSocket Protocol & API v3 Requirements

* **Primary Endpoint**: `wss://ws.derivws.com/websockets/v3?app_id={APP_ID}&l=EN&brand=deriv`
* **Ping Interval**: Heartbeat ping sent every 30 seconds (`{ "ping": 1 }`) to maintain persistent keep-alive.
* **Automatic Reconnect**: If the WebSocket drops, the runtime pauses strategy evaluation, reconnects with exponential backoff (1s, 2s, 4s, 8s max), re-authorizes, and re-subscribes to active proposal and tick streams.

---

## 13. Account Requirements

* **Currency Handling**: The bot automatically adopts the currency of the active authorized account (e.g. `USD`, `EUR`, `BTC`).
* **Balance Synchronization**: The bot listens to `balance` subscription updates from Deriv and updates both the Bot Telemetry HUD and the platform Navbar balance badge simultaneously.
* **Minimum Stake Validation**: The bot validates the stake against Deriv's contract specifications before sending `proposal` requests to prevent invalid parameter errors.

---

## 14. Demo vs. Real Account Separation

* **Explicit Visual Indicator**: When running on a Real account, the Bots Center displays a high-visibility amber warning badge (**"LIVE REAL MONEY EXECUTION"**).
* **Execution Guardrail**: Starting a bot on a Real account requires a two-step confirmation dialog highlighting the configured Stop Loss and Max Stake.
* **Demo Isolation**: Demo strategies (`VRTC...`) trade entirely with virtual funds without affecting real account balances.

---

## 15. Security & Client-Side Execution Safety

1. **Browser Sandboxing**: All user strategies execute inside `JS-Interpreter` without access to `window`, `document`, `localStorage`, or `fetch` globals.
2. **Max Loss / Stop-Loss Circuit Breaker**: Hard-coded platform safety watchdog: if cumulative bot loss reaches the user's defined Max Loss limit, the platform immediately aborts the bot execution loop regardless of strategy logic.
3. **Consecutive Loss Limiter**: Automatic pause if the strategy encounters a configured number of consecutive losses (e.g., 5 losses).

---

## 16. Licensing, Branding & Terms of Use

* **Google Blockly**: Licensed under Apache 2.0. Permitted for integration, commercial use, and customization.
* **Deriv API & DBot**: Governed by Deriv Developers Terms of Service. Third-party applications registered with an official `App ID` are permitted to execute automated trades via WebSocket API v3.
* **Branding Integrity**: Third-party applications must clearly display "Powered by Deriv API" without impersonating official Deriv websites.

---

## 17. Unsupported Assumptions (What NOT to Do)

❌ **Do NOT build a custom non-Blockly node graph**: Deriv users expect the standard Blockly interface compatible with `.xml` files from [bot.deriv.com](https://bot.deriv.com).  
❌ **Do NOT invent custom block names**: Blocks must follow Deriv's standard naming (`trade_definition`, `before_purchase`, `during_purchase`, `after_purchase`, `purchase`, `trade_again`).  
❌ **Do NOT invent a proprietary JSON format**: The file standard is Deriv Blockly XML.  
❌ **Do NOT run bots in a background server process**: Strategy evaluation belongs client-side in the browser over the trader's authorized WebSocket stream.

---

## 18. Final Recommended Architecture & Decisive Route

### **DECISIVE SELECTION: OPTION C (EMBEDDED OFFICIAL DERIV BLOCKLY ENGINE)**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    PRECISIONEDGE / TRADER'S COMPANION PLATFORM                  │
│                     (React 19 + TypeScript + Vite + Tailwind)                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│ • Navigation & Theme Engine        • 60fps Live Canvas Charting Engine          │
│ • SmartTrader Multi-Barrier Suite  • 1,000-Tick Digits Probability Suite        │
│ • AI Market Copilot & Insights     • Portfolio & Audit Transaction Ledgers      │
│ • OAuth 2.0 PKCE Security Proxy    • Multi-Account VRTC / Real Switcher         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                               BOTS CENTER VIEW                                  │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                    DERIV BLOCKLY STUDIO WORKSPACE                         │  │
│  │  • Official Deriv Block Definitions (Trade Def, Purchase, After Purchase) │  │
│  │  • Full 2-Way `.xml` Import / Export Compatible with bot.deriv.com        │  │
│  │  • Preset Strategy Library (Martingale, D'Alembert, Oscar's Grind)        │  │
│  │  • JS-Interpreter Client Execution Engine over Deriv WebSocket API v3    │  │
│  │  • Live Telemetry Cockpit (Streak, Current Stake, P/L, Safety Kill Switch)│  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

This architecture gives traders the best of both worlds:
1. **100% Deriv DBot Strategy Interoperability**: Any strategy created on [bot.deriv.com](https://bot.deriv.com) can be imported, edited, run, and exported.
2. **Comprehensive Trading Platform**: Traders enjoy our high-performance manual trading terminals, real-time digit statistics, and AI analysis alongside automated bot trading.
