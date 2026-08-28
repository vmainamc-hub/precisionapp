export const DERIV_TOOLBOX_CONFIG = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Trade Parameters',
      colour: '#0284c7',
      contents: [
        { kind: 'block', type: 'trade_definition_market' },
        { kind: 'block', type: 'trade_definition_tradetype' },
        { kind: 'block', type: 'trade_definition_tradeoptions' }
      ]
    },
    {
      kind: 'category',
      name: 'Purchase Conditions',
      colour: '#059669',
      contents: [
        { kind: 'block', type: 'purchase' },
        { kind: 'block', type: 'deriv_tick_spot' },
        { kind: 'block', type: 'deriv_last_digit' }
      ]
    },
    {
      kind: 'category',
      name: 'Post-Trade & Restart',
      colour: '#7c3aed',
      contents: [
        { kind: 'block', type: 'trade_again' },
        { kind: 'block', type: 'contract_check_result' },
        { kind: 'block', type: 'read_details' }
      ]
    },
    {
      kind: 'category',
      name: 'Indicators',
      colour: '#06b6d4',
      contents: [
        { kind: 'block', type: 'deriv_rsi' },
        { kind: 'block', type: 'deriv_sma' },
        { kind: 'block', type: 'deriv_ema' }
      ]
    },
    {
      kind: 'category',
      name: 'Risk & Money Management',
      colour: '#ef4444',
      contents: [
        { kind: 'block', type: 'martingale_calculator' },
        { kind: 'block', type: 'stop_loss_guard' }
      ]
    },
    {
      kind: 'sep'
    },
    {
      kind: 'category',
      name: 'Logic',
      colour: '#3b82f6',
      contents: [
        { kind: 'block', type: 'controls_if' },
        { kind: 'block', type: 'logic_compare' },
        { kind: 'block', type: 'logic_operation' },
        { kind: 'block', type: 'logic_negate' },
        { kind: 'block', type: 'logic_boolean' }
      ]
    },
    {
      kind: 'category',
      name: 'Math',
      colour: '#10b981',
      contents: [
        { kind: 'block', type: 'math_number' },
        { kind: 'block', type: 'math_arithmetic' },
        { kind: 'block', type: 'math_single' },
        { kind: 'block', type: 'math_round' }
      ]
    },
    {
      kind: 'category',
      name: 'Variables',
      custom: 'VARIABLE',
      colour: '#f59e0b'
    }
  ]
};
