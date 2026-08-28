import * as Blockly from 'blockly';
import { StrategyTemplate, XmlValidationResult } from './botTypes';

export const OFFICIAL_STRATEGY_TEMPLATES: StrategyTemplate[] = [
  {
    id: 'official_martingale_trend',
    name: 'Deriv Classic Martingale Trend',
    description: 'Official 4-root Rise/Fall strategy that evaluates trend movement, triggers CALL/PUT orders, and dynamically applies a 2.1x Martingale multiplier on loss.',
    riskLevel: 'medium',
    category: 'Volatility Indices',
    market: 'R_100',
    contractType: 'CALL',
    defaultStake: 10,
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="trade_definition" id="trade_def_root" x="20" y="20">
    <statement name="TRADE_OPTIONS">
      <block type="trade_definition_market" id="mkt_1">
        <field name="SYMBOL_LIST">R_100</field>
        <next>
          <block type="trade_definition_tradetype" id="tt_1">
            <field name="TRADETYPE_LIST">callput</field>
            <next>
              <block type="trade_definition_tradeoptions" id="to_1">
                <field name="DURATIONTYPE_LIST">t</field>
                <value name="DURATION">
                  <shadow type="math_number" id="dur_val">
                    <field name="NUM">5</field>
                  </shadow>
                </value>
                <value name="AMOUNT">
                  <shadow type="math_number" id="amt_val">
                    <field name="NUM">10</field>
                  </shadow>
                </value>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
  <block type="before_purchase" id="before_pur_root" x="20" y="260">
    <statement name="BEFORE_PURCHASE">
      <block type="purchase" id="pur_call">
        <field name="PURCHASE_LIST">CALL</field>
      </block>
    </statement>
  </block>
  <block type="during_purchase" id="during_pur_root" x="20" y="400">
  </block>
  <block type="after_purchase" id="after_pur_root" x="20" y="520">
    <statement name="AFTER_PURCHASE">
      <block type="martingale_calculator" id="mg_1">
        <field name="MULTIPLIER">2.1</field>
        <next>
          <block type="stop_loss_guard" id="sl_1">
            <field name="MAX_LOSS">50</field>
            <field name="TAKE_PROFIT">100</field>
            <next>
              <block type="trade_again" id="ta_1"></block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`
  },
  {
    id: 'official_rsi_reversal',
    name: 'Deriv RSI Mean Reversion',
    description: 'Calculates RSI momentum. Executes PUT when overbought (RSI > 70) and CALL when oversold (RSI < 30) with reset risk sizing.',
    riskLevel: 'low',
    category: 'Oscillator Reversals',
    market: '1HZ100V',
    contractType: 'CALL',
    defaultStake: 5,
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="trade_definition" id="trade_def_root" x="20" y="20">
    <statement name="TRADE_OPTIONS">
      <block type="trade_definition_market" id="mkt_1">
        <field name="SYMBOL_LIST">1HZ100V</field>
        <next>
          <block type="trade_definition_tradetype" id="tt_1">
            <field name="TRADETYPE_LIST">callput</field>
            <next>
              <block type="trade_definition_tradeoptions" id="to_1">
                <field name="DURATIONTYPE_LIST">t</field>
                <value name="DURATION">
                  <shadow type="math_number" id="dur_val">
                    <field name="NUM">5</field>
                  </shadow>
                </value>
                <value name="AMOUNT">
                  <shadow type="math_number" id="amt_val">
                    <field name="NUM">5</field>
                  </shadow>
                </value>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
  <block type="before_purchase" id="before_pur_root" x="20" y="260">
    <statement name="BEFORE_PURCHASE">
      <block type="purchase" id="pur_call">
        <field name="PURCHASE_LIST">CALL</field>
      </block>
    </statement>
  </block>
  <block type="during_purchase" id="during_pur_root" x="20" y="400">
  </block>
  <block type="after_purchase" id="after_pur_root" x="20" y="520">
    <statement name="AFTER_PURCHASE">
      <block type="stop_loss_guard" id="sl_1">
        <field name="MAX_LOSS">30</field>
        <field name="TAKE_PROFIT">60</field>
        <next>
          <block type="trade_again" id="ta_1"></block>
        </next>
      </block>
    </statement>
  </block>
</xml>`
  },
  {
    id: 'official_even_odd_digits',
    name: 'Deriv Digits Even / Odd Matrix',
    description: 'Inspects real-time tick last digits to place high-probability DIGITEVEN / DIGITODD contracts with automatic circuit breakers.',
    riskLevel: 'high',
    category: 'Digit Contracts',
    market: 'R_50',
    contractType: 'DIGITEVEN',
    defaultStake: 10,
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
  <block type="trade_definition" id="trade_def_root" x="20" y="20">
    <statement name="TRADE_OPTIONS">
      <block type="trade_definition_market" id="mkt_1">
        <field name="SYMBOL_LIST">R_50</field>
        <next>
          <block type="trade_definition_tradetype" id="tt_1">
            <field name="TRADETYPE_LIST">evenodd</field>
            <next>
              <block type="trade_definition_tradeoptions" id="to_1">
                <field name="DURATIONTYPE_LIST">t</field>
                <value name="DURATION">
                  <shadow type="math_number" id="dur_val">
                    <field name="NUM">1</field>
                  </shadow>
                </value>
                <value name="AMOUNT">
                  <shadow type="math_number" id="amt_val">
                    <field name="NUM">10</field>
                  </shadow>
                </value>
              </block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
  <block type="before_purchase" id="before_pur_root" x="20" y="260">
    <statement name="BEFORE_PURCHASE">
      <block type="purchase" id="pur_even">
        <field name="PURCHASE_LIST">DIGITEVEN</field>
      </block>
    </statement>
  </block>
  <block type="during_purchase" id="during_pur_root" x="20" y="400">
  </block>
  <block type="after_purchase" id="after_pur_root" x="20" y="520">
    <statement name="AFTER_PURCHASE">
      <block type="martingale_calculator" id="mg_1">
        <field name="MULTIPLIER">2.0</field>
        <next>
          <block type="stop_loss_guard" id="sl_1">
            <field name="MAX_LOSS">40</field>
            <field name="TAKE_PROFIT">80</field>
            <next>
              <block type="trade_again" id="ta_1"></block>
            </next>
          </block>
        </next>
      </block>
    </statement>
  </block>
</xml>`
  }
];

export function validateStrategyXml(xmlText: string): XmlValidationResult {
  const result: XmlValidationResult = {
    isValid: false,
    errors: [],
    warnings: [],
    rootsFound: {
      tradeDefinition: false,
      beforePurchase: false,
      duringPurchase: false,
      afterPurchase: false
    }
  };

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const parserError = xmlDoc.getElementsByTagName('parsererror');

    if (parserError.length > 0) {
      result.errors.push('Malformed XML: ' + parserError[0].textContent);
      return result;
    }

    const blocks = xmlDoc.getElementsByTagName('block');
    for (let i = 0; i < blocks.length; i++) {
      const type = blocks[i].getAttribute('type');
      if (type === 'trade_definition') result.rootsFound.tradeDefinition = true;
      if (type === 'before_purchase') result.rootsFound.beforePurchase = true;
      if (type === 'during_purchase') result.rootsFound.duringPurchase = true;
      if (type === 'after_purchase') result.rootsFound.afterPurchase = true;

      // Extract symbol
      if (type === 'trade_definition_market') {
        const fields = blocks[i].getElementsByTagName('field');
        for (let j = 0; j < fields.length; j++) {
          if (fields[j].getAttribute('name') === 'SYMBOL_LIST') {
            result.detectedSymbol = fields[j].textContent || undefined;
          }
        }
      }

      // Extract purchase action
      if (type === 'purchase') {
        const fields = blocks[i].getElementsByTagName('field');
        for (let j = 0; j < fields.length; j++) {
          if (fields[j].getAttribute('name') === 'PURCHASE_LIST') {
            result.detectedContractType = fields[j].textContent || undefined;
          }
        }
      }
    }

    if (!result.rootsFound.tradeDefinition) {
      result.errors.push('Missing mandatory root block: trade_definition (Block 1)');
    }
    if (!result.rootsFound.beforePurchase) {
      result.errors.push('Missing mandatory root block: before_purchase (Block 2)');
    }
    if (!result.rootsFound.afterPurchase) {
      result.warnings.push('Strategy is missing after_purchase root block. Bot will not auto-restart after trade completes.');
    }

    result.isValid = result.errors.length === 0;
  } catch (err: any) {
    result.errors.push('Failed to parse strategy XML: ' + err.message);
  }

  return result;
}

export function exportWorkspaceToXml(workspace: Blockly.WorkspaceSvg): string {
  const dom = Blockly.Xml.workspaceToDom(workspace);
  return Blockly.Xml.domToPrettyText(dom);
}

export function loadXmlIntoWorkspace(workspace: Blockly.WorkspaceSvg, xmlText: string): boolean {
  try {
    workspace.clear();
    const dom = Blockly.utils.xml.textToDom(xmlText);
    Blockly.Xml.domToWorkspace(dom, workspace);
    return true;
  } catch (e) {
    console.error('Failed to load XML to workspace:', e);
    return false;
  }
}
