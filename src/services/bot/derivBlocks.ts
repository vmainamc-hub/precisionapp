import * as Blockly from 'blockly';
import { javascriptGenerator, Order } from 'blockly/javascript';

let blocksInitialized = false;

export function initDerivBlocks() {
  if (blocksInitialized) return;
  blocksInitialized = true;

  // 1. ROOT BLOCK: trade_definition
  Blockly.Blocks['trade_definition'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('1. Define Trade Contract');
      this.appendStatementInput('TRADE_OPTIONS')
        .setCheck(null)
        .appendField('Trade Parameters');
      this.appendStatementInput('INITIALIZATION')
        .setCheck(null)
        .appendField('Custom Variables');
      this.appendStatementInput('SUBMARKET')
        .setCheck(null)
        .appendField('Stake & Duration');
      this.setColour('#0284c7');
      this.setTooltip('Mandatory Deriv Root: Defines market, contract type, and parameters');
      this.setHelpUrl('https://bot.deriv.com');
      this.setDeletable(false);
    }
  };

  javascriptGenerator.forBlock['trade_definition'] = function (block) {
    const tradeOptions = javascriptGenerator.statementToCode(block, 'TRADE_OPTIONS');
    const initCode = javascriptGenerator.statementToCode(block, 'INITIALIZATION');
    const submarketCode = javascriptGenerator.statementToCode(block, 'SUBMARKET');
    return `// Trade Definition\n${tradeOptions}\n${initCode}\n${submarketCode}\n`;
  };

  // 2. ROOT BLOCK: before_purchase
  Blockly.Blocks['before_purchase'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('2. Purchase Conditions');
      this.appendStatementInput('BEFORE_PURCHASE')
        .setCheck(null)
        .appendField('When Conditions Met:');
      this.setColour('#059669');
      this.setTooltip('Mandatory Deriv Root: Checked before placing a new trade order');
      this.setHelpUrl('https://bot.deriv.com');
      this.setDeletable(false);
    }
  };

  javascriptGenerator.forBlock['before_purchase'] = function (block) {
    const statements = javascriptGenerator.statementToCode(block, 'BEFORE_PURCHASE');
    return `function onBeforePurchase(tick, candles) {\n${statements}\n}\n`;
  };

  // 3. ROOT BLOCK: during_purchase
  Blockly.Blocks['during_purchase'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('3. During Purchase (Optional)');
      this.appendStatementInput('DURING_PURCHASE')
        .setCheck(null)
        .appendField('In-Trade Actions:');
      this.setColour('#d97706');
      this.setTooltip('Checked while a contract is actively running');
      this.setHelpUrl('https://bot.deriv.com');
      this.setDeletable(false);
    }
  };

  javascriptGenerator.forBlock['during_purchase'] = function (block) {
    const statements = javascriptGenerator.statementToCode(block, 'DURING_PURCHASE');
    return `function onDuringPurchase(contract) {\n${statements}\n}\n`;
  };

  // 4. ROOT BLOCK: after_purchase
  Blockly.Blocks['after_purchase'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('4. Post-Trade Analysis & Restart');
      this.appendStatementInput('AFTER_PURCHASE')
        .setCheck(null)
        .appendField('On Contract Settlement:');
      this.setColour('#7c3aed');
      this.setTooltip('Mandatory Deriv Root: Executed after contract is closed to evaluate P/L and restart');
      this.setHelpUrl('https://bot.deriv.com');
      this.setDeletable(false);
    }
  };

  javascriptGenerator.forBlock['after_purchase'] = function (block) {
    const statements = javascriptGenerator.statementToCode(block, 'AFTER_PURCHASE');
    return `function onAfterPurchase(contractResult) {\n${statements}\n}\n`;
  };

  // --- Trade Parameter Blocks ---

  Blockly.Blocks['trade_definition_market'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Market:')
        .appendField(new Blockly.FieldDropdown([
          ['Volatility 100 Index', 'R_100'],
          ['Volatility 75 Index', 'R_75'],
          ['Volatility 50 Index', 'R_50'],
          ['Volatility 25 Index', 'R_25'],
          ['Volatility 10 Index', 'R_10'],
          ['Volatility 100 (1s) Index', '1HZ100V'],
          ['Volatility 75 (1s) Index', '1HZ75V'],
          ['Volatility 50 (1s) Index', '1HZ50V'],
          ['Volatility 25 (1s) Index', '1HZ25V'],
          ['Volatility 10 (1s) Index', '1HZ10V'],
          ['Boom 1000 Index', 'BOOM1000'],
          ['Crash 1000 Index', 'CRASH1000'],
          ['EUR/USD Forex', 'frxEURUSD'],
          ['GBP/USD Forex', 'frxGBPUSD']
        ]), 'SYMBOL_LIST');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#0284c7');
      this.setTooltip('Selects target underlying asset symbol');
    }
  };

  javascriptGenerator.forBlock['trade_definition_market'] = function (block) {
    const symbol = block.getFieldValue('SYMBOL_LIST');
    return `botContext.symbol = '${symbol}';\n`;
  };

  Blockly.Blocks['trade_definition_tradetype'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Contract Type:')
        .appendField(new Blockly.FieldDropdown([
          ['Rise / Fall (CALL / PUT)', 'callput'],
          ['Higher / Lower', 'highlow'],
          ['Touch / No Touch', 'touchnotouch'],
          ['Matches / Differs', 'matchesdiffers'],
          ['Even / Odd', 'evenodd'],
          ['Over / Under', 'overunder']
        ]), 'TRADETYPE_LIST');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#0284c7');
    }
  };

  javascriptGenerator.forBlock['trade_definition_tradetype'] = function (block) {
    const type = block.getFieldValue('TRADETYPE_LIST');
    return `botContext.tradeType = '${type}';\n`;
  };

  Blockly.Blocks['trade_definition_tradeoptions'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Duration Unit:')
        .appendField(new Blockly.FieldDropdown([
          ['Ticks', 't'],
          ['Seconds', 's'],
          ['Minutes', 'm'],
          ['Hours', 'h']
        ]), 'DURATIONTYPE_LIST');
      this.appendValueInput('DURATION')
        .setCheck('Number')
        .appendField('Duration:');
      this.appendValueInput('AMOUNT')
        .setCheck('Number')
        .appendField('Initial Stake ($):');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#0284c7');
    }
  };

  javascriptGenerator.forBlock['trade_definition_tradeoptions'] = function (block) {
    const durationUnit = block.getFieldValue('DURATIONTYPE_LIST');
    const duration = javascriptGenerator.valueToCode(block, 'DURATION', Order.ATOMIC) || '5';
    const amount = javascriptGenerator.valueToCode(block, 'AMOUNT', Order.ATOMIC) || '10';
    return `botContext.durationUnit = '${durationUnit}';\nbotContext.duration = ${duration};\nbotContext.baseStake = ${amount};\nbotContext.currentStake = ${amount};\n`;
  };

  // --- Purchase Trigger Blocks ---

  Blockly.Blocks['purchase'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Execute Order:')
        .appendField(new Blockly.FieldDropdown([
          ['Purchase CALL / RISE', 'CALL'],
          ['Purchase PUT / FALL', 'PUT'],
          ['Purchase HIGHER', 'HIGHER'],
          ['Purchase LOWER', 'LOWER'],
          ['Purchase DIGITMATCH', 'DIGITMATCH'],
          ['Purchase DIGITDIFF', 'DIGITDIFF'],
          ['Purchase DIGITEVEN', 'DIGITEVEN'],
          ['Purchase DIGITODD', 'DIGITODD'],
          ['Purchase DIGITOVER', 'DIGITOVER'],
          ['Purchase DIGITUNDER', 'DIGITUNDER'],
          ['Purchase ONETOUCH', 'ONETOUCH'],
          ['Purchase NOTOUCH', 'NOTOUCH']
        ]), 'PURCHASE_LIST');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#059669');
      this.setTooltip('Places trade order via Deriv API');
    }
  };

  javascriptGenerator.forBlock['purchase'] = function (block) {
    const contractType = block.getFieldValue('PURCHASE_LIST');
    return `derivPurchase('${contractType}');\n`;
  };

  Blockly.Blocks['trade_again'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('🔁 Trade Again');
      this.setPreviousStatement(true, null);
      this.setColour('#7c3aed');
      this.setTooltip('Repeats trading cycle on next tick');
    }
  };

  javascriptGenerator.forBlock['trade_again'] = function () {
    return `derivTradeAgain();\n`;
  };

  // --- Condition & Result Blocks ---

  Blockly.Blocks['contract_check_result'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Last Trade Was:')
        .appendField(new Blockly.FieldDropdown([
          ['Won (Profit > 0)', 'win'],
          ['Lost (Loss)', 'loss']
        ]), 'CHECK_RESULT');
      this.setOutput(true, 'Boolean');
      this.setColour('#8b5cf6');
    }
  };

  javascriptGenerator.forBlock['contract_check_result'] = function (block) {
    const res = block.getFieldValue('CHECK_RESULT');
    const code = res === 'win' ? 'contractResult.isWin' : '!contractResult.isWin';
    return [code, Order.LOGICAL_NOT];
  };

  Blockly.Blocks['read_details'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Read Contract Detail:')
        .appendField(new Blockly.FieldDropdown([
          ['Net Profit / Loss ($)', 'profit'],
          ['Contract Payout ($)', 'payout'],
          ['Entry Spot Price', 'entry_spot'],
          ['Exit Spot Price', 'exit_spot'],
          ['Last Digit', 'last_digit'],
          ['Total Runs Count', 'runs_count']
        ]), 'DETAIL_INDEX');
      this.setOutput(true, 'Number');
      this.setColour('#8b5cf6');
    }
  };

  javascriptGenerator.forBlock['read_details'] = function (block) {
    const detail = block.getFieldValue('DETAIL_INDEX');
    let code = 'contractResult.profit';
    if (detail === 'profit') code = 'contractResult.profit';
    else if (detail === 'payout') code = 'contractResult.payout';
    else if (detail === 'entry_spot') code = 'contractResult.entrySpot';
    else if (detail === 'exit_spot') code = 'contractResult.exitSpot';
    else if (detail === 'last_digit') code = 'contractResult.lastDigit';
    else if (detail === 'runs_count') code = 'botContext.totalTrades';
    return [code, Order.MEMBER];
  };

  // --- Technical Indicator Blocks ---

  Blockly.Blocks['deriv_rsi'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('RSI Indicator (Period:')
        .appendField(new Blockly.FieldNumber(14, 2, 100), 'PERIOD')
        .appendField(')');
      this.setOutput(true, 'Number');
      this.setColour('#06b6d4');
      this.setTooltip('Returns Relative Strength Index (0 - 100) from live candle stream');
    }
  };

  javascriptGenerator.forBlock['deriv_rsi'] = function (block) {
    const period = block.getFieldValue('PERIOD');
    return [`derivGetRSI(${period})`, Order.FUNCTION_CALL];
  };

  Blockly.Blocks['deriv_sma'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('SMA (Period:')
        .appendField(new Blockly.FieldNumber(20, 2, 200), 'PERIOD')
        .appendField(')');
      this.setOutput(true, 'Number');
      this.setColour('#06b6d4');
    }
  };

  javascriptGenerator.forBlock['deriv_sma'] = function (block) {
    const period = block.getFieldValue('PERIOD');
    return [`derivGetSMA(${period})`, Order.FUNCTION_CALL];
  };

  Blockly.Blocks['deriv_ema'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('EMA (Period:')
        .appendField(new Blockly.FieldNumber(12, 2, 200), 'PERIOD')
        .appendField(')');
      this.setOutput(true, 'Number');
      this.setColour('#06b6d4');
    }
  };

  javascriptGenerator.forBlock['deriv_ema'] = function (block) {
    const period = block.getFieldValue('PERIOD');
    return [`derivGetEMA(${period})`, Order.FUNCTION_CALL];
  };

  Blockly.Blocks['deriv_last_digit'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Latest Tick Last Digit (0-9)');
      this.setOutput(true, 'Number');
      this.setColour('#06b6d4');
    }
  };

  javascriptGenerator.forBlock['deriv_last_digit'] = function () {
    return ['derivGetLastDigit()', Order.FUNCTION_CALL];
  };

  Blockly.Blocks['deriv_tick_spot'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Current Tick Price');
      this.setOutput(true, 'Number');
      this.setColour('#06b6d4');
    }
  };

  javascriptGenerator.forBlock['deriv_tick_spot'] = function () {
    return ['derivGetTickPrice()', Order.FUNCTION_CALL];
  };

  // --- Money Management Blocks ---

  Blockly.Blocks['martingale_calculator'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Martingale Stake Sizer')
        .appendField('Multiplier:')
        .appendField(new Blockly.FieldNumber(2.1, 1.1, 10, 0.1), 'MULTIPLIER');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#ef4444');
      this.setTooltip('Multiplies stake after loss, resets stake to base upon win');
    }
  };

  javascriptGenerator.forBlock['martingale_calculator'] = function (block) {
    const mult = block.getFieldValue('MULTIPLIER');
    return `if (!contractResult.isWin) {\n  botContext.currentStake = Math.round(botContext.currentStake * ${mult} * 100) / 100;\n} else {\n  botContext.currentStake = botContext.baseStake;\n}\n`;
  };

  Blockly.Blocks['stop_loss_guard'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Safety Check: Max Loss ($)')
        .appendField(new Blockly.FieldNumber(50, 1, 10000), 'MAX_LOSS')
        .appendField('Take Profit ($)')
        .appendField(new Blockly.FieldNumber(100, 1, 50000), 'TAKE_PROFIT');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#ef4444');
    }
  };

  javascriptGenerator.forBlock['stop_loss_guard'] = function (block) {
    const maxLoss = block.getFieldValue('MAX_LOSS');
    const takeProfit = block.getFieldValue('TAKE_PROFIT');
    return `if (botContext.netProfit <= -${maxLoss} || botContext.netProfit >= ${takeProfit}) {\n  derivStopBot('Target limit reached');\n}\n`;
  };
}
