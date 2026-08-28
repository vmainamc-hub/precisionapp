# Official Deriv Developer Support Inquiry: Bot Template & DBot Integration

**Date**: August 28, 2026  
**Project**: PrecisionEdge / Trader's Companion  
**To**: Deriv Developer Support (`api-support@deriv.com` / Deriv Community Portal)  

---

## Background & Project Context
We are developing a third-party multi-asset trading and analytics platform (**Trader's Companion**) connected to Deriv via OAuth 2.0 PKCE and WebSocket API v3. 

Our application includes custom dashboards, SmartTrader workspaces, real-time tick/digit analyzers, and risk management ledgers. We are now integrating automated trading capabilities and wish to align 100% with the official Deriv Bot (DBot / Blockly) standard rather than reinventing a proprietary visual block builder.

We have reviewed [developers.deriv.com/app-builder/](https://developers.deriv.com/app-builder/) and Deriv's open-source GitHub repositories under `@deriv-com` (`trading-bot-template`, `binary-bot`). To ensure strict compliance with Deriv's developer ecosystem, policies, and technical standards, we request clarification on the following items:

---

## Specific Questions for Deriv Developer Support

1. **Conversion of Existing Applications**:  
   *Can an existing registered Deriv API application (with an assigned `App ID`) utilize the official Bot template, or is the Bot template strictly tied to a new application registration?*

2. **Source Code Availability**:  
   *Is the complete source code for the official Deriv Bot / DBot Blockly workspace available for third-party developers beyond what is published in `deriv-com/trading-bot-template` and `deriv-com/binary-bot`?*

3. **GitHub Integration**:  
   *Does Deriv App Builder support direct export/synchronization with GitHub repositories, or is forking `deriv-com/trading-bot-template` the recommended path?*

4. **Existing GitHub Repositories**:  
   *Can the official Bot components and Blockly engine be integrated directly into an existing third-party GitHub repository (e.g., `github.com/vmainamc-hub/trader-s-companion`)?*

5. **Integration with Broader Multi-View Applications**:  
   *Are there technical or architectural constraints on embedding the official Blockly workspace as a sub-view within a comprehensive trading terminal that also contains custom analysis tools (SmartTrader, Digits Analyzer, Portfolio History)?*

6. **Custom Domain Deployment**:  
   *Can a custom-branded application hosting the official Bot template be deployed under our own domain (e.g., `https://our-domain.com`), provided the domain is registered in the Redirect URI list on the Deriv Developer portal?*

7. **UI Customization Boundaries**:  
   *What are the permitted boundaries for customizing the UI surrounding the Blockly workspace (e.g., custom dark mode themes, navigation headers, side panels, and sound controls)?*

8. **OAuth Application & App ID Reuse**:  
   *Can our single existing OAuth `App ID` be used concurrently for manual trading (Rise/Fall, Digits) and automated Bot trading, or does Deriv require distinct App IDs for manual vs. automated traffic?*

9. **Separate App ID Requirements**:  
   *Under what circumstances (if any) does Deriv mandate a separate App ID for Bot trading?*

10. **Official Standard for Blockly Functionality**:  
    *Is using Deriv's Blockly block definitions (4-block structure: Parameters, Purchase Conditions, Sell Conditions, Restart/Money Management) the mandatory standard for third-party platforms offering visual bot builders?*

11. **Custom UI Wrapper Policy**:  
    *Are third-party developers permitted to build custom diagnostic panels (e.g., live win/loss counters, martingale multiplier displays, execution logs) around the official Bot engine?*

12. **Bot Monitoring & Telemetry APIs**:  
    *What is the recommended WebSocket API subscription model for monitoring bot contract lifecycle in real time (`proposal_open_contract`, `statement`, or specialized automation hooks)?*

13. **Official NPM Packages & SDKs**:  
    *Does Deriv publish or recommend specific npm packages (such as `@deriv/bot-web-ui`, `@deriv/bot-skeleton`, or `@deriv/deriv-api`) for integrating DBot into modern React/TypeScript/Vite bundlers?*

14. **Licensing & Branding Guidelines**:  
    *What specific trademark, disclaimer, and attribution guidelines must third-party platforms adhere to when displaying "Powered by Deriv" or "Deriv Bot Compatible"?*

15. **Embedding Restrictions**:  
    *Are there security or sandboxing restrictions (e.g., Content-Security-Policy, iframe permissions) when hosting or embedding the Blockly workspace on custom HTTPS domains?*

---

## Contact Information
- **Developer Name**: PrecisionEdge / Trader's Companion Development Team  
- **Email**: `vmainamc@gmail.com`  
- **Repository**: [github.com/vmainamc-hub/trader-s-companion](https://github.com/vmainamc-hub/trader-s-companion)  
- **Developer Portal Account**: Active Deriv Developer Account
