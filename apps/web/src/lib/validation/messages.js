export const VALIDATION_MESSAGES = {
  battery_voltage_compatible: {
    pass: 'Battery voltage is compatible with system voltage',
    error: 'Battery voltage is not compatible with system voltage. System voltage must be evenly divisible by battery voltage.',
  },
  battery_autonomy_adequate: {
    pass: 'Days of autonomy is adequate',
    warning: 'Days of autonomy is set to 0. The system will have no backup capacity.',
  },
  battery_dod_reasonable: {
    pass: 'Battery depth of discharge is within safe limits',
    warning: 'Battery depth of discharge exceeds 95%. This may reduce battery lifespan significantly.',
  },
  battery_count_even: {
    pass: 'Battery count forms complete series strings',
    error: 'Total battery count does not form complete series strings. Ensure batteries divide evenly into series groups.',
  },
  inverter_size_adequate: {
    pass: 'Selected inverter size meets the required capacity',
    error: 'Selected inverter is undersized for the calculated peak load. Choose a larger inverter.',
  },
  inverter_size_oversized: {
    pass: 'Inverter size is appropriately matched to load',
    warning: 'Selected inverter is more than 2× the required size. This may reduce efficiency and increase cost.',
  },
  string_voc_within_limit: {
    pass: 'String VOC is within inverter maximum input voltage',
    error: 'String open-circuit voltage at minimum temperature exceeds inverter maximum PV input voltage. Reduce panels per string.',
  },
  string_vmp_above_mppt_min: {
    pass: 'String VMP is above MPPT minimum voltage',
    error: 'String voltage at maximum temperature falls below inverter MPPT minimum range. Increase panels per string.',
  },
  string_vmp_below_mppt_max: {
    pass: 'String VMP is within MPPT maximum voltage',
    warning: 'String voltage at maximum temperature exceeds inverter MPPT maximum range. Consider reducing panels per string.',
  },
  string_valid_range_exists: {
    pass: 'A valid string configuration exists for this panel/inverter combination',
    error: 'No valid string configuration exists for this panel and inverter combination. The minimum panels per string exceeds the maximum. Choose a different panel or inverter.',
  },
  string_current_within_inverter: {
    pass: 'Total array current is within inverter input current limit',
    error: 'Total array current exceeds inverter maximum PV input current. Reduce the number of parallel strings or choose a higher-rated inverter.',
  },
  wire_dc_array_drop: {
    pass: 'DC array cable voltage drop is within limits',
    warning: 'DC array cable voltage drop exceeds the specified maximum. Consider using a larger cable size or reducing cable length.',
  },
  wire_dc_battery_drop: {
    pass: 'DC battery cable voltage drop is within limits',
    warning: 'DC battery cable voltage drop exceeds the specified maximum. Consider using a larger cable size or reducing cable length.',
  },
  wire_ac_drop: {
    pass: 'AC output cable voltage drop is within limits',
    warning: 'AC output cable voltage drop exceeds the specified maximum. Consider using a larger cable size or reducing cable length.',
  },
  energy_input_present: {
    pass: 'Daily energy consumption has been specified',
    error: 'No daily energy consumption specified. Enter appliance data or a utility bill value.',
  },
  peak_load_present: {
    pass: 'Peak load has been specified',
    error: 'No peak load specified. Complete the load analysis or enter a manual peak load value.',
  },
  system_efficiency_reasonable: {
    pass: 'System efficiency is within a reasonable range',
    warning: 'System efficiency is outside the typical range of 70–95%. Verify this value is correct.',
  },
  psh_reasonable: {
    pass: 'Peak sun hours value is within a reasonable range',
    warning: 'Peak sun hours is outside the typical range of 2–9 hours. Verify this value is correct.',
  },
};
