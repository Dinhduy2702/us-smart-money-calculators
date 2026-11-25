/**
 * SmartMoney US - 2026 Tax & Wealth Calculators
 * SINGLE CONFIGURATION FILE FOR AFFILIATE OFFERS & ECOSYSTEM LINKS
 *
 * Huong dan cho Duy:
 * - Dan link Affiliate tai chinh My (HYSA, Brokerage, Tax Software, Mortgage) hoac link Kenh YT Finance (AGY 3) / Gumroad (AGY 5) vao ben trong dau "".
 * - Muc de trong "" se tu dong hien trang thai "Setup pending" (khong bao gio co nut chet).
 */
window.SMARTMONEY_CONFIG = {
  brand: {
    name: "SmartMoney US",
    subtitle: "2026 Tax & Wealth Calculators",
    taxYear: "2026",
    lastUpdated: "Nov 2026"
  },
  ecosystem: {
    youtubeFinance: {
      label: "Watch US Finance Guides on YouTube",
      url: "" // AGY 3 cap nhat link kenh YT Finance EN khi lap xong
    },
    gumroadSheets: {
      label: "US Personal Finance & Wealth OS (2026 Sheets)",
      url: "" // AGY 5 cap nhat link Gumroad SP #2 (US Personal Finance & Wealth OS) khi xong
    },
    gumroadYtOs: {
      label: "YouTube Empire OS 2026 (Creator Edition)",
      url: "https://897833387907.gumroad.com/l/youtube-empire-os-2026"
    }
  },
  affiliates: [
    {
      id: "hysa",
      context: ["paycheck", "compound", "freelance"],
      badge: "Cash Reserve",
      title: "High-Yield Savings Accounts (FDIC Insured)",
      summary: "Keep your emergency fund and quarterly tax reserves earning competitive APY instead of sitting in a 0.01% checking account.",
      ctaLabel: "Compare Top HYSA Rates",
      url: "" // Dan link Affiliate HYSA (SoFi / Ally / Marcus / Wealthfront)
    },
    {
      id: "brokerage",
      context: ["compound", "paycheck"],
      badge: "Index Investing",
      title: "Commission-Free S&P 500 & IRA Brokerages",
      summary: "Automate monthly contributions into low-cost index ETFs and tax-advantaged Roth IRA accounts.",
      ctaLabel: "Compare Investing Platforms",
      url: "" // Dan link Affiliate Brokerage (M1 / Webull / Fidelity / Robinhood)
    },
    {
      id: "tax-software",
      context: ["paycheck", "freelance"],
      badge: "Tax Filing",
      title: "2026 Federal & 50-State Online Tax Filing",
      summary: "File W-2 and 1099 freelance returns accurately with built-in deduction checks and quarterly estimate reminders.",
      ctaLabel: "Compare Tax Filing Tools",
      url: "" // Dan link Affiliate Tax Software (TurboTax / FreeTaxUSA / H&R Block)
    },
    {
      id: "mortgage-lenders",
      context: ["mortgage", "auto"],
      badge: "Loan Rates",
      title: "Compare Today's 30-Year Mortgage & Auto APRs",
      summary: "Even a 0.50% lower interest rate on a $400,000 mortgage can save over $40,000 in lifetime interest.",
      ctaLabel: "Check Current Lender Rates",
      url: "" // Dan link Affiliate LendingTree / Bankrate / Credible
    }
  ]
};
