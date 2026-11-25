/**
 * 2026 US Federal & 50-State + DC Tax Data
 * Educational estimation dataset for SmartMoney US.
 * Federal brackets reflect inflation-adjusted standard deduction & progressive rates.
 */
window.US_TAX_DATA = {
  year: 2026,
  fica: {
    socialSecurityRate: 0.062,
    socialSecurityWageCap: 176100,
    medicareRate: 0.0145,
    additionalMedicareThresholdSingle: 200000,
    additionalMedicareThresholdMarried: 250000,
    additionalMedicareRate: 0.009
  },
  standardDeduction: {
    single: 15000,
    married: 30000,
    hoh: 22500
  },
  federalBrackets: {
    single: [
      { upTo: 11925, rate: 0.10 },
      { upTo: 48475, rate: 0.12 },
      { upTo: 103350, rate: 0.22 },
      { upTo: 197300, rate: 0.24 },
      { upTo: 250525, rate: 0.32 },
      { upTo: 626350, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 }
    ],
    married: [
      { upTo: 23850, rate: 0.10 },
      { upTo: 96950, rate: 0.12 },
      { upTo: 206700, rate: 0.22 },
      { upTo: 394600, rate: 0.24 },
      { upTo: 501050, rate: 0.32 },
      { upTo: 751600, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 }
    ],
    hoh: [
      { upTo: 17000, rate: 0.10 },
      { upTo: 64850, rate: 0.12 },
      { upTo: 103350, rate: 0.22 },
      { upTo: 197300, rate: 0.24 },
      { upTo: 250500, rate: 0.32 },
      { upTo: 626350, rate: 0.35 },
      { upTo: Infinity, rate: 0.37 }
    ]
  },
  // All 50 US States + District of Columbia
  // type: "none" (0%), "flat" (flat rate), "progressive" (effective baseline + top marginal rate)
  states: [
    { code: "AL", name: "Alabama", type: "progressive", baseRate: 0.036, topRate: 0.050 },
    { code: "AK", name: "Alaska", type: "none", baseRate: 0, topRate: 0 },
    { code: "AZ", name: "Arizona", type: "flat", baseRate: 0.025, topRate: 0.025 },
    { code: "AR", name: "Arkansas", type: "progressive", baseRate: 0.032, topRate: 0.039 },
    { code: "CA", name: "California", type: "progressive", baseRate: 0.052, topRate: 0.133 },
    { code: "CO", name: "Colorado", type: "flat", baseRate: 0.044, topRate: 0.044 },
    { code: "CT", name: "Connecticut", type: "progressive", baseRate: 0.048, topRate: 0.0699 },
    { code: "DE", name: "Delaware", type: "progressive", baseRate: 0.046, topRate: 0.066 },
    { code: "DC", name: "District of Columbia", type: "progressive", baseRate: 0.058, topRate: 0.1075 },
    { code: "FL", name: "Florida", type: "none", baseRate: 0, topRate: 0 },
    { code: "GA", name: "Georgia", type: "flat", baseRate: 0.0539, topRate: 0.0539 },
    { code: "HI", name: "Hawaii", type: "progressive", baseRate: 0.062, topRate: 0.110 },
    { code: "ID", name: "Idaho", type: "flat", baseRate: 0.05695, topRate: 0.05695 },
    { code: "IL", name: "Illinois", type: "flat", baseRate: 0.0495, topRate: 0.0495 },
    { code: "IN", name: "Indiana", type: "flat", baseRate: 0.030, topRate: 0.030 },
    { code: "IA", name: "Iowa", type: "flat", baseRate: 0.038, topRate: 0.038 },
    { code: "KS", name: "Kansas", type: "progressive", baseRate: 0.045, topRate: 0.0558 },
    { code: "KY", name: "Kentucky", type: "flat", baseRate: 0.040, topRate: 0.040 },
    { code: "LA", name: "Louisiana", type: "flat", baseRate: 0.030, topRate: 0.030 },
    { code: "ME", name: "Maine", type: "progressive", baseRate: 0.052, topRate: 0.0715 },
    { code: "MD", name: "Maryland", type: "progressive", baseRate: 0.045, topRate: 0.0575 },
    { code: "MA", name: "Massachusetts", type: "flat", baseRate: 0.050, topRate: 0.050 },
    { code: "MI", name: "Michigan", type: "flat", baseRate: 0.0425, topRate: 0.0425 },
    { code: "MN", name: "Minnesota", type: "progressive", baseRate: 0.056, topRate: 0.0985 },
    { code: "MS", name: "Mississippi", type: "flat", baseRate: 0.044, topRate: 0.044 },
    { code: "MO", name: "Missouri", type: "progressive", baseRate: 0.038, topRate: 0.047 },
    { code: "MT", name: "Montana", type: "progressive", baseRate: 0.045, topRate: 0.059 },
    { code: "NE", name: "Nebraska", type: "progressive", baseRate: 0.042, topRate: 0.052 },
    { code: "NV", name: "Nevada", type: "none", baseRate: 0, topRate: 0 },
    { code: "NH", name: "New Hampshire", type: "none", baseRate: 0, topRate: 0 },
    { code: "NJ", name: "New Jersey", type: "progressive", baseRate: 0.042, topRate: 0.1075 },
    { code: "NM", name: "New Mexico", type: "progressive", baseRate: 0.040, topRate: 0.059 },
    { code: "NY", name: "New York", type: "progressive", baseRate: 0.054, topRate: 0.109 },
    { code: "NC", name: "North Carolina", type: "flat", baseRate: 0.0425, topRate: 0.0425 },
    { code: "ND", name: "North Dakota", type: "progressive", baseRate: 0.015, topRate: 0.025 },
    { code: "OH", name: "Ohio", type: "progressive", baseRate: 0.025, topRate: 0.035 },
    { code: "OK", name: "Oklahoma", type: "progressive", baseRate: 0.038, topRate: 0.0475 },
    { code: "OR", name: "Oregon", type: "progressive", baseRate: 0.068, topRate: 0.099 },
    { code: "PA", name: "Pennsylvania", type: "flat", baseRate: 0.0307, topRate: 0.0307 },
    { code: "RI", name: "Rhode Island", type: "progressive", baseRate: 0.040, topRate: 0.0599 },
    { code: "SC", name: "South Carolina", type: "progressive", baseRate: 0.044, topRate: 0.062 },
    { code: "SD", name: "South Dakota", type: "none", baseRate: 0, topRate: 0 },
    { code: "TN", name: "Tennessee", type: "none", baseRate: 0, topRate: 0 },
    { code: "TX", name: "Texas", type: "none", baseRate: 0, topRate: 0 },
    { code: "UT", name: "Utah", type: "flat", baseRate: 0.0455, topRate: 0.0455 },
    { code: "VT", name: "Vermont", type: "progressive", baseRate: 0.048, topRate: 0.0875 },
    { code: "VA", name: "Virginia", type: "progressive", baseRate: 0.046, topRate: 0.0575 },
    { code: "WA", name: "Washington", type: "none", baseRate: 0, topRate: 0 },
    { code: "WV", name: "West Virginia", type: "progressive", baseRate: 0.038, topRate: 0.0482 },
    { code: "WI", name: "Wisconsin", type: "progressive", baseRate: 0.046, topRate: 0.0765 },
    { code: "WY", name: "Wyoming", type: "none", baseRate: 0, topRate: 0 }
  ]
};
