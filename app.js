(function () {
  "use strict";

  const THEME_KEY = "smartmoney_us_theme_v1";
  const STATE_KEY = "smartmoney_us_inputs_v2";
  const TAX = window.US_TAX_DATA;
  const CONFIG = window.SMARTMONEY_CONFIG;

  const TOOL_META = {
    paycheck: {
      title: "2026 US Paycheck & 50-State Take-Home Calculator",
      desc: "Compare take-home pay across any two US states, inspect your exact 2026 marginal federal tax brackets, and see how 401(k) and HSA deductions cut your tax bill."
    },
    compound: {
      title: "Compound Interest & S&P 500 Wealth Calculator",
      desc: "Model long-term compounding with inflation-adjusted buying power, side-by-side benchmarks, and an exportable year-by-year schedule."
    },
    mortgage: {
      title: "US Mortgage PITI & Early Payoff Calculator",
      desc: "Calculate full monthly PITI, test extra monthly or biweekly payments to cut years off your mortgage, and inspect your annual amortization schedule."
    },
    auto: {
      title: "US Auto Loan & 20/4/10 Affordability Calculator",
      desc: "Stress-test your vehicle financing against the 20/4/10 rule and compare total interest across 36, 48, 60, and 72-month terms."
    },
    freelance: {
      title: "2026 US 1099 Freelance & Quarterly Tax Estimator",
      desc: "Calculate Self-Employment tax (15.3%), QBI 20% deduction, quick business write-offs, and your four 2026 IRS quarterly payment deadlines."
    }
  };

  const PRESETS = {
    paycheck: [
      { label: "Entry Tech ($85k · CA vs TX)", set: { paySalary: 85000, payState: "CA", payCompareState: "TX", payFiling: "single", payFreq: "26", pay401k: 6, payHsa: 0, payHealth: 2400 } },
      { label: "Senior SWE ($165k · CA vs WA)", set: { paySalary: 165000, payState: "CA", payCompareState: "WA", payFiling: "single", payFreq: "26", pay401k: 12, payHsa: 4300, payHealth: 3000 } },
      { label: "NYC Finance ($140k · NY vs FL)", set: { paySalary: 140000, payState: "NY", payCompareState: "FL", payFiling: "single", payFreq: "24", pay401k: 10, payHsa: 2000, payHealth: 2800 } },
      { label: "Family ($135k · Married · IL vs TX)", set: { paySalary: 135000, payState: "IL", payCompareState: "TX", payFiling: "married", payFreq: "26", pay401k: 8, payHsa: 4000, payHealth: 5400 } }
    ],
    compound: [
      { label: "Roth IRA Max ($583/mo · 30 yrs)", set: { cmpInitial: 5000, cmpMonthly: 583, cmpRate: 10, cmpYears: 30, cmpInflation: 2.5, cmpCompareMode: "hysa" } },
      { label: "FIRE $1M Push ($1,500/mo · 20 yrs)", set: { cmpInitial: 25000, cmpMonthly: 1500, cmpRate: 10, cmpYears: 20, cmpInflation: 2.5, cmpCompareMode: "delay" } },
      { label: "Starter ($300/mo · 35 yrs)", set: { cmpInitial: 2000, cmpMonthly: 300, cmpRate: 10, cmpYears: 35, cmpInflation: 2.5, cmpCompareMode: "boost" } },
      { label: "Cash Reserve ($25k · HYSA 4.5%)", set: { cmpInitial: 25000, cmpMonthly: 400, cmpRate: 4.5, cmpYears: 10, cmpInflation: 2.5, cmpCompareMode: "boost" } }
    ],
    mortgage: [
      { label: "US Median ($420k · +$200/mo)", set: { mtgPrice: 420000, mtgDownPct: 20, mtgRate: 6.5, mtgTerm: "30", mtgExtraMonthly: 200, mtgBiweekly: false, mtgTaxRate: 1.1, mtgIns: 1600, mtgHoa: 0 } },
      { label: "First-Time Buyer ($360k · 5% Down)", set: { mtgPrice: 360000, mtgDownPct: 5, mtgRate: 6.625, mtgTerm: "30", mtgExtraMonthly: 150, mtgBiweekly: false, mtgTaxRate: 1.2, mtgIns: 1500, mtgHoa: 120 } },
      { label: "Biweekly Payoff ($500k · 20% Down)", set: { mtgPrice: 500000, mtgDownPct: 20, mtgRate: 6.25, mtgTerm: "30", mtgExtraMonthly: 0, mtgBiweekly: true, mtgTaxRate: 1.15, mtgIns: 1800, mtgHoa: 0 } },
      { label: "15-Yr Aggressive ($450k)", set: { mtgPrice: 450000, mtgDownPct: 20, mtgRate: 5.75, mtgTerm: "15", mtgExtraMonthly: 0, mtgBiweekly: false, mtgTaxRate: 1.1, mtgIns: 1600, mtgHoa: 0 } }
    ],
    auto: [
      { label: "20/4/10 Ideal ($32k · 48m)", set: { autoPrice: 32000, autoDown: 6500, autoApr: 6.25, autoMonths: "48", autoTax: 7.0, autoMonthlyIncome: 7500 } },
      { label: "Family SUV ($44k · 60m)", set: { autoPrice: 44000, autoDown: 8000, autoApr: 6.9, autoMonths: "60", autoTax: 7.5, autoMonthlyIncome: 8200 } },
      { label: "72-Mo Trap Check ($52k)", set: { autoPrice: 52000, autoDown: 4000, autoApr: 8.5, autoMonths: "72", autoTax: 8.0, autoMonthlyIncome: 6500 } }
    ],
    freelance: [
      { label: "Side Hustle ($35k · CA)", set: { flRevenue: 35000, flExpenses: 4000, flState: "CA", flFiling: "single", flHomeOffice: 1200, flGear: 1500, flMiles: 800 } },
      { label: "Full-Time Creator ($95k · CA)", set: { flRevenue: 95000, flExpenses: 10000, flState: "CA", flFiling: "single", flHomeOffice: 1500, flGear: 2500, flMiles: 1500 } },
      { label: "Solo Consultant ($160k · TX)", set: { flRevenue: 160000, flExpenses: 18000, flState: "TX", flFiling: "married", flHomeOffice: 2400, flGear: 4000, flMiles: 2500 } }
    ]
  };

  const SAVED_FIELDS = [
    "paySalary", "payState", "payCompareState", "payFiling", "payFreq", "pay401k", "payHsa", "payHealth",
    "cmpInitial", "cmpMonthly", "cmpRate", "cmpYears", "cmpInflation", "cmpCompareMode",
    "mtgPrice", "mtgDownPct", "mtgRate", "mtgTerm", "mtgExtraMonthly", "mtgBiweekly", "mtgTaxRate", "mtgIns", "mtgHoa",
    "autoPrice", "autoDown", "autoApr", "autoMonths", "autoTax", "autoMonthlyIncome",
    "flRevenue", "flExpenses", "flState", "flFiling", "flHomeOffice", "flGear", "flMiles"
  ];

  const URL_PARAM_MAP = {
    paycheck: {
      salary: "paySalary", state: "payState", compare: "payCompareState",
      filing: "payFiling", freq: "payFreq", k401: "pay401k", hsa: "payHsa", health: "payHealth"
    },
    compound: {
      initial: "cmpInitial", monthly: "cmpMonthly", rate: "cmpRate",
      years: "cmpYears", inflation: "cmpInflation", bench: "cmpCompareMode"
    },
    mortgage: {
      price: "mtgPrice", down: "mtgDownPct", rate: "mtgRate", term: "mtgTerm",
      extra: "mtgExtraMonthly", biweekly: "mtgBiweekly", tax: "mtgTaxRate", ins: "mtgIns", hoa: "mtgHoa"
    },
    auto: {
      price: "autoPrice", down: "autoDown", apr: "autoApr",
      months: "autoMonths", tax: "autoTax", income: "autoMonthlyIncome"
    },
    freelance: {
      rev: "flRevenue", exp: "flExpenses", state: "flState", filing: "flFiling",
      office: "flHomeOffice", gear: "flGear", miles: "flMiles"
    }
  };

  const RESULT_CTA_COPY = {
    paycheck: {
      title: "Turn This Paycheck Into an Automated 2026 Budget & Net Worth Plan",
      desc: "Track take-home pay, 50/30/20 buckets, 401(k) growth, and FIRE milestones automatically in Google Sheets."
    },
    compound: {
      title: "Track Your Real S&P 500 Portfolio & FIRE Number Automatically",
      desc: "Replace scattered spreadsheets with the US Personal Finance & Wealth OS (2026 Google Sheets)."
    },
    mortgage: {
      title: "Track Home Equity, Extra Payments & Total Net Worth in One Sheet",
      desc: "Monitor mortgage payoff progress alongside your savings and investments in Google Sheets."
    },
    auto: {
      title: "Keep Car Payments Under 10% With a Full Monthly Cash-Flow OS",
      desc: "Track auto loans, debt snowball payoff, and monthly savings rate inside one automated Google Sheet."
    },
    freelance: {
      title: "Track 1099 Income, Business Write-Offs & Quarterly IRS Reserves",
      desc: "Organize freelance revenue, deductions, and net worth in the US Personal Finance & Wealth OS."
    }
  };

  let activeTool = "paycheck";
  let lastSummaryText = "";
  let toastTimer = null;
  let lastCmpSchedule = [];
  let lastMtgSchedule = [];

  const $ = (id) => document.getElementById(id);

  function fmtUSD(n) {
    const val = Math.round(Number(n) || 0);
    return (val < 0 ? "-$" : "$") + Math.abs(val).toLocaleString("en-US");
  }

  function fmtCompactUSD(n) {
    const v = Number(n) || 0;
    if (v >= 1000000) return "$" + (v / 1000000).toFixed(2) + "M";
    if (v >= 1000) return "$" + Math.round(v / 1000) + "k";
    return fmtUSD(v);
  }

  function fmtPct(n) {
    return (Number(n) || 0).toFixed(1) + "%";
  }

  function showToast(msg) {
    const box = $("toastBox");
    box.textContent = msg;
    box.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { box.hidden = true; }, 2600);
  }

  function downloadCsv(filename, headers, rows) {
    const lines = [headers.join(",")].concat(
      rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`);
  }

  /* Save & Restore Inputs */
  function saveInputs() {
    const data = {};
    SAVED_FIELDS.forEach((id) => {
      const el = $(id);
      if (!el) return;
      data[id] = el.type === "checkbox" ? el.checked : el.value;
    });
    try { localStorage.setItem(STATE_KEY, JSON.stringify(data)); } catch (_) {}
  }

  function restoreInputs() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      SAVED_FIELDS.forEach((id) => {
        const el = $(id);
        if (!el || data[id] === undefined) return;
        if (el.type === "checkbox") el.checked = Boolean(data[id]);
        else el.value = data[id];
      });
    } catch (_) {}
  }

  function syncSlidersFromInputs() {
    $("paySalarySlider").value = Math.min(350000, Math.max(25000, Number($("paySalary").value) || 25000));
    $("cmpYearsSlider").value = Math.min(45, Math.max(1, Number($("cmpYears").value) || 1));
    $("mtgPriceSlider").value = Math.min(1500000, Math.max(150000, Number($("mtgPrice").value) || 150000));
  }

  /* Shareable URL Query Params (?tab=...&salary=...&state=...) */
  function buildShareUrl() {
    const params = new URLSearchParams();
    params.set("tab", activeTool);
    const map = URL_PARAM_MAP[activeTool] || {};
    Object.entries(map).forEach(([paramKey, elId]) => {
      const el = $(elId);
      if (!el) return;
      const val = el.type === "checkbox" ? (el.checked ? "1" : "0") : String(el.value);
      params.set(paramKey, val);
    });
    const base = window.location.origin + window.location.pathname;
    return `${base}?${params.toString()}`;
  }

  function applyUrlParams() {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    const targetTab = TOOL_META[tabParam] ? tabParam : null;
    if (!targetTab) return null;

    const map = URL_PARAM_MAP[targetTab] || {};
    Object.entries(map).forEach(([paramKey, elId]) => {
      if (!params.has(paramKey)) return;
      const el = $(elId);
      if (!el) return;
      const raw = params.get(paramKey);
      if (el.type === "checkbox") {
        el.checked = raw === "1" || raw === "true";
      } else {
        el.value = raw;
      }
    });
    return targetTab;
  }

  /* Federal Progressive Tax Engine (2026) with Per-Bracket Breakdown */
  function calcFederalDetails(taxableIncome, filingStatus) {
    const income = Math.max(0, taxableIncome);
    const brackets = TAX.federalBrackets[filingStatus] || TAX.federalBrackets.single;
    let totalTax = 0;
    let prev = 0;
    let marginalRate = brackets[0].rate;
    const tiers = [];

    for (const b of brackets) {
      const span = b.upTo === Infinity ? Math.max(0, income - prev) : b.upTo - prev;
      const taxableInTier = income > prev ? Math.min(income, b.upTo) - prev : 0;
      const taxInTier = taxableInTier * b.rate;
      if (taxableInTier > 0) marginalRate = b.rate;
      totalTax += taxInTier;
      tiers.push({
        rate: b.rate,
        from: prev,
        upTo: b.upTo,
        taxable: taxableInTier,
        tax: taxInTier,
        fillPct: span > 0 && b.upTo !== Infinity ? Math.min(100, (taxableInTier / span) * 100) : (taxableInTier > 0 ? 100 : 0)
      });
      prev = b.upTo;
    }
    return { totalTax, marginalRate, tiers };
  }

  function calcStateTax(taxableIncome, stateCode) {
    const st = TAX.states.find((s) => s.code === stateCode) || TAX.states[0];
    const income = Math.max(0, taxableIncome);
    if (st.type === "none" || income <= 0) return { tax: 0, state: st };
    if (st.type === "flat") return { tax: income * st.baseRate, state: st };
    const highWeight = Math.min(1, Math.max(0, (income - 75000) / 350000));
    const effectiveRate = st.baseRate + (st.topRate - st.baseRate) * highWeight * 0.65;
    return { tax: income * effectiveRate, state: st };
  }

  function calcFica(grossWages, filingStatus) {
    const ssWages = Math.min(grossWages, TAX.fica.socialSecurityWageCap);
    const ss = ssWages * TAX.fica.socialSecurityRate;
    const med = grossWages * TAX.fica.medicareRate;
    const addThresh = filingStatus === "married"
      ? TAX.fica.additionalMedicareThresholdMarried
      : TAX.fica.additionalMedicareThresholdSingle;
    const addMed = Math.max(0, grossWages - addThresh) * TAX.fica.additionalMedicareRate;
    return ss + med + addMed;
  }

  function renderDonut(svgEl, segments) {
    const r = 56;
    const circ = 2 * Math.PI * r;
    const total = segments.reduce((s, x) => s + Math.max(0, x.value), 0) || 1;
    let offset = 0;
    svgEl.innerHTML = segments.map((seg) => {
      const val = Math.max(0, seg.value);
      const len = (val / total) * circ;
      const html = `<circle cx="74" cy="74" r="${r}" fill="none" stroke="${seg.color}" stroke-width="20" stroke-dasharray="${len.toFixed(2)} ${(circ - len).toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}"></circle>`;
      offset += len;
      return html;
    }).join("");
  }

  function computePaycheckForState(salary, stateCode, filing, k401Pct, hsa, health) {
    const k401 = Math.min(23500, salary * (k401Pct / 100));
    const preTaxTotal = k401 + hsa + health;
    const stdDed = TAX.standardDeduction[filing] || 15000;
    const fedTaxable = Math.max(0, salary - preTaxTotal - stdDed);
    const fedInfo = calcFederalDetails(fedTaxable, filing);

    const stateTaxable = Math.max(0, salary - preTaxTotal - Math.min(stdDed, 10000));
    const { tax: stateTax, state: stObj } = calcStateTax(stateTaxable, stateCode);

    const fica = calcFica(Math.max(0, salary - health - hsa), filing);
    const totalTax = fedInfo.totalTax + stateTax + fica;
    const annualNet = Math.max(0, salary - totalTax - preTaxTotal);

    // Tax shield saved by 401(k) + HSA
    const fedNoPreTax = calcFederalDetails(Math.max(0, salary - health - stdDed), filing).totalTax;
    const stateNoPreTax = calcStateTax(Math.max(0, salary - health - Math.min(stdDed, 10000)), stateCode).tax;
    const taxShield = Math.max(0, (fedNoPreTax + stateNoPreTax) - (fedInfo.totalTax + stateTax));

    return { k401, hsa, health, preTaxTotal, fedTaxable, fedInfo, stateTax, stObj, fica, totalTax, annualNet, taxShield };
  }

  /* TOOL 1: PAYCHECK */
  function updatePaycheck() {
    const salary = Math.max(0, Number($("paySalary").value) || 0);
    const stateCode = $("payState").value;
    const compareCode = $("payCompareState").value;
    const filing = $("payFiling").value;
    const freq = Number($("payFreq").value) || 26;
    const k401Pct = Math.min(50, Math.max(0, Number($("pay401k").value) || 0));
    const hsa = Math.max(0, Number($("payHsa").value) || 0);
    const health = Math.max(0, Number($("payHealth").value) || 0);

    $("paySalaryHint").textContent = `${fmtUSD(salary)} / yr`;
    $("pay401kHint").textContent = `${k401Pct}% (${fmtUSD(Math.min(23500, salary * (k401Pct / 100)))})`;

    const res = computePaycheckForState(salary, stateCode, filing, k401Pct, hsa, health);
    const cmp = computePaycheckForState(salary, compareCode, filing, k401Pct, hsa, health);

    const perCheck = res.annualNet / freq;
    const freqNames = { 26: "Bi-Weekly", 24: "Semi-Monthly", 12: "Monthly", 52: "Weekly", 1: "Annual" };
    $("payPrimaryLabel").textContent = `Estimated ${freqNames[freq] || ""} Take-Home Pay`;
    $("payPrimaryValue").textContent = fmtUSD(perCheck);
    $("payAnnualSub").textContent = `Annual Net Pay: ${fmtUSD(res.annualNet)} (Gross: ${fmtUSD(salary)})`;

    $("payStateBadge").textContent = res.stObj.type === "none"
      ? `${res.stObj.code}: No State Income Tax`
      : `${res.stObj.code}: ${res.stObj.type === "flat" ? "Flat" : "Progressive"} State Tax`;

    const effTaxPct = salary > 0 ? (res.totalTax / salary) * 100 : 0;
    const keepPct = salary > 0 ? (res.annualNet / salary) * 100 : 0;
    $("payEffTax").textContent = fmtPct(effTaxPct);
    $("payMarginalRate").textContent = `${Math.round(res.fedInfo.marginalRate * 100)}%`;
    $("payMonthlyNet").textContent = fmtUSD(res.annualNet / 12);
    $("payHourlyNet").textContent = `${fmtUSD(res.annualNet / 2080)}/hr`;
    $("payKeepPct").textContent = `${Math.round(keepPct)}%`;

    renderDonut($("payDonutSvg"), [
      { value: res.annualNet, color: "var(--accent-emerald)" },
      { value: res.fedInfo.totalTax, color: "var(--accent-navy)" },
      { value: res.stateTax, color: "var(--accent-amber)" },
      { value: res.fica, color: "var(--accent-slate)" },
      { value: res.preTaxTotal, color: "#94A3B8" }
    ]);

    $("payBreakdownBody").innerHTML = `
      <tr><td><span class="swatch" style="background:var(--accent-emerald);"></span>Net Take-Home Pay</td><td class="tabular">${fmtUSD(res.annualNet)}</td></tr>
      <tr><td><span class="swatch" style="background:var(--accent-navy);"></span>Federal Income Tax</td><td class="tabular">-${fmtUSD(res.fedInfo.totalTax)}</td></tr>
      <tr><td><span class="swatch" style="background:var(--accent-amber);"></span>${res.stObj.name} State Tax</td><td class="tabular">-${fmtUSD(res.stateTax)}</td></tr>
      <tr><td><span class="swatch" style="background:var(--accent-slate);"></span>FICA (Social Security &amp; Medicare)</td><td class="tabular">-${fmtUSD(res.fica)}</td></tr>
      <tr><td><span class="swatch" style="background:#94A3B8;"></span>401(k), HSA &amp; Health Pre-Tax</td><td class="tabular">-${fmtUSD(res.preTaxTotal)}</td></tr>
      <tr><td>Gross Annual Salary</td><td class="tabular">${fmtUSD(salary)}</td></tr>
    `;

    // State A vs State B Comparison Banner
    const diffAnnual = cmp.annualNet - res.annualNet;
    const diffMonthly = diffAnnual / 12;
    if (res.stObj.code === cmp.stObj.code) {
      $("payCompareBox").innerHTML = `<strong>State Comparison:</strong> Pick a different 2nd state on the left (such as Texas, Florida, or New York) to see your exact relocation take-home difference.`;
    } else if (diffAnnual > 0) {
      $("payCompareBox").innerHTML = `<strong>${res.stObj.code} vs. ${cmp.stObj.code}:</strong> Earning ${fmtUSD(salary)} in <strong>${cmp.stObj.name}</strong> nets <strong>${fmtUSD(cmp.annualNet)}/yr</strong> <span class="compare-delta">+${fmtUSD(diffAnnual)}/yr (+${fmtUSD(diffMonthly)}/mo)</span> more take-home pay than ${res.stObj.name}.`;
    } else if (diffAnnual < 0) {
      $("payCompareBox").innerHTML = `<strong>${res.stObj.code} vs. ${cmp.stObj.code}:</strong> Staying in <strong>${res.stObj.name}</strong> saves you <span class="compare-delta">+${fmtUSD(Math.abs(diffAnnual))}/yr</span> compared to ${cmp.stObj.name} (${fmtUSD(cmp.annualNet)}/yr net).`;
    } else {
      $("payCompareBox").innerHTML = `<strong>${res.stObj.code} vs. ${cmp.stObj.code}:</strong> Both states yield the exact same estimated take-home pay of <strong>${fmtUSD(res.annualNet)}/yr</strong>.`;
    }

    // Smart Insight
    const shieldNote = res.taxShield > 0
      ? `Your pre-tax 401(k) &amp; HSA contributions shielded <strong>${fmtUSD(res.taxShield)}</strong> from 2026 taxes.`
      : `Tip: Contributing even 6% to a traditional 401(k) lowers your taxable income in the ${Math.round(res.fedInfo.marginalRate * 100)}% marginal bracket.`;
    $("payInsightBox").innerHTML = `<strong>Why this number:</strong> Your federal taxable income after deductions is <strong>${fmtUSD(res.fedTaxable)}</strong>. While your top dollar is taxed at <strong>${Math.round(res.fedInfo.marginalRate * 100)}%</strong>, your true blended tax rate across all taxes is <strong>${fmtPct(effTaxPct)}</strong>. ${shieldNote}`;

    // Bracket Ladder
    $("payBracketLadder").innerHTML = res.fedInfo.tiers.map((t) => {
      const rangeLabel = t.upTo === Infinity ? `${fmtUSD(t.from)}+` : `${fmtUSD(t.from)} to ${fmtUSD(t.upTo)}`;
      const taxedLabel = t.taxable > 0 ? `${rangeLabel} (${fmtUSD(t.taxable)} taxed)` : `${rangeLabel}`;
      return `
        <div class="bracket-row">
          <span class="bracket-rate tabular">${Math.round(t.rate * 100)}%</span>
          <div class="bracket-track">
            <div class="bracket-fill" style="width:${t.fillPct.toFixed(1)}%;"></div>
            <span class="bracket-range-txt tabular">${taxedLabel}</span>
          </div>
          <span class="bracket-tax tabular">${fmtUSD(t.tax)}</span>
        </div>
      `;
    }).join("");

    if (activeTool === "paycheck") {
      lastSummaryText = `SmartMoney US (2026): ${fmtUSD(salary)} in ${res.stObj.name} (${filing}) -> ${fmtUSD(res.annualNet)}/yr net (${fmtUSD(res.annualNet / 12)}/mo, ${fmtPct(effTaxPct)} effective tax). vs ${cmp.stObj.name}: ${fmtUSD(cmp.annualNet)}/yr.`;
    }
  }

  /* TOOL 2: COMPOUND INTEREST */
  function simCompound(initial, monthly, annualRate, years) {
    const rMonth = annualRate / 12;
    let balance = initial;
    let contrib = initial;
    const yearly = [];
    for (let y = 1; y <= years; y++) {
      const startBal = balance;
      const startContrib = contrib;
      for (let m = 0; m < 12; m++) {
        balance = balance * (1 + rMonth) + monthly;
        contrib += monthly;
      }
      const yrInterest = Math.max(0, (balance - startBal) - (contrib - startContrib));
      yearly.push({ year: y, principal: contrib, yrInterest, growth: Math.max(0, balance - contrib), total: balance });
    }
    return yearly;
  }

  function updateCompound() {
    const initial = Math.max(0, Number($("cmpInitial").value) || 0);
    const monthly = Math.max(0, Number($("cmpMonthly").value) || 0);
    const rate = Math.max(0, Number($("cmpRate").value) || 0) / 100;
    const years = Math.min(50, Math.max(1, Number($("cmpYears").value) || 1));
    const inflation = Math.max(0, Number($("cmpInflation").value) || 0) / 100;
    const cmpMode = $("cmpCompareMode").value;

    $("cmpRateHint").textContent = `${(rate * 100).toFixed(1)}%`;
    $("cmpYearsHint").textContent = `${years} years`;

    const yearly = simCompound(initial, monthly, rate, years).map((row) => ({
      ...row,
      realTotal: row.total / Math.pow(1 + inflation, row.year)
    }));
    lastCmpSchedule = yearly;

    const finalObj = yearly[yearly.length - 1];
    const growthShare = finalObj.total > 0 ? Math.round((finalObj.growth / finalObj.total) * 100) : 0;

    $("cmpFinalValue").textContent = fmtUSD(finalObj.total);
    $("cmpRealSub").textContent = `Inflation-adjusted buying power (${(inflation * 100).toFixed(1)}%/yr): ${fmtUSD(finalObj.realTotal)} in today's dollars`;
    $("cmpPrincipal").textContent = fmtUSD(finalObj.principal);
    $("cmpInterest").textContent = fmtUSD(finalObj.growth);
    $("cmpSafeMonthly").textContent = `${fmtUSD((finalObj.total * 0.04) / 12)}/mo`;

    // Benchmark Comparison Card
    if (cmpMode === "hysa") {
      const hysaEnd = simCompound(initial, monthly, 0.045, years)[years - 1].total;
      const delta = finalObj.total - hysaEnd;
      $("cmpCompareCard").className = "compare-banner is-reward";
      $("cmpCompareCard").innerHTML = `<strong>vs. 4.5% High-Yield Savings (${fmtUSD(hysaEnd)}):</strong> Investing at ${(rate * 100).toFixed(1)}% builds <span class="compare-delta ${delta < 0 ? "is-neg" : ""}">${delta >= 0 ? "+" : ""}${fmtUSD(delta)}</span> ${delta >= 0 ? "more wealth" : "less"} over ${years} years.`;
    } else if (cmpMode === "boost") {
      const boostEnd = simCompound(initial, monthly + 200, rate, years)[years - 1].total;
      const delta = boostEnd - finalObj.total;
      $("cmpCompareCard").className = "compare-banner is-reward";
      $("cmpCompareCard").innerHTML = `<strong>What if you add +$200/mo?</strong> Your balance jumps to <strong>${fmtUSD(boostEnd)}</strong> <span class="compare-delta">+${fmtUSD(delta)} extra</span> from just ${fmtUSD(200 * 12 * years)} in added deposits.`;
    } else {
      const waitYears = Math.max(1, years - 5);
      const delayEnd = simCompound(initial, monthly, rate, waitYears)[waitYears - 1].total;
      const costOfWaiting = Math.max(0, finalObj.total - delayEnd);
      $("cmpCompareCard").className = "compare-banner";
      $("cmpCompareCard").innerHTML = `<strong>Cost of Waiting 5 Years:</strong> Starting 5 years later leaves you with <strong>${fmtUSD(delayEnd)}</strong> <span class="compare-delta is-neg">-${fmtUSD(costOfWaiting)} lost</span> in missed compounding.`;
    }

    // Chart bars (up to 7 milestones)
    const step = Math.max(1, Math.ceil(years / 7));
    const sampled = [];
    for (let i = step - 1; i < yearly.length; i += step) sampled.push(yearly[i]);
    if (sampled[sampled.length - 1] !== finalObj) sampled.push(finalObj);

    const maxVal = finalObj.total || 1;
    $("cmpChartBars").innerHTML = sampled.map((pt) => {
      const totalH = Math.max(6, Math.round((pt.total / maxVal) * 100));
      const pShare = pt.total > 0 ? (pt.principal / pt.total) * 100 : 100;
      const gShare = Math.max(0, 100 - pShare);
      return `
        <div class="bar-col" title="Year ${pt.year}: ${fmtUSD(pt.total)} (Contributed: ${fmtUSD(pt.principal)}, Growth: ${fmtUSD(pt.growth)})">
          <span class="bar-val-top tabular">${fmtCompactUSD(pt.total)}</span>
          <div class="bar-stack" style="height:${totalH}%;">
            <div class="bar-seg-principal" style="height:${pShare.toFixed(1)}%;"></div>
            <div class="bar-seg-growth" style="height:${gShare.toFixed(1)}%;"></div>
          </div>
          <span class="bar-yr tabular">Yr ${pt.year}</span>
        </div>
      `;
    }).join("");

    const doubleYrs = rate > 0 ? (72 / (rate * 100)).toFixed(1) : "N/A";
    $("cmpInsightBox").innerHTML = `<strong>Compounding Insight:</strong> <strong>${growthShare}%</strong> of your ending balance is pure investment growth. At ${(rate * 100).toFixed(1)}% annual return, your money doubles roughly every <strong>${doubleYrs} years</strong> (Rule of 72).`;

    $("cmpScheduleBody").innerHTML = yearly.map((r) => `
      <tr>
        <td>Year ${r.year}</td>
        <td>${fmtUSD(r.principal)}</td>
        <td>+${fmtUSD(r.yrInterest)}</td>
        <td><strong>${fmtUSD(r.total)}</strong></td>
        <td>${fmtUSD(r.realTotal)}</td>
      </tr>
    `).join("");

    if (activeTool === "compound") {
      lastSummaryText = `SmartMoney US Compound: ${fmtUSD(initial)} start + ${fmtUSD(monthly)}/mo at ${(rate * 100).toFixed(1)}% for ${years} yrs -> ${fmtUSD(finalObj.total)} (${fmtUSD(finalObj.realTotal)} in today's dollars).`;
    }
  }

  /* TOOL 3: US MORTGAGE + EXTRA PAYMENT AMORTIZATION */
  function simAmortization(loan, apr, termYears, extraMonthly, price) {
    const nMax = termYears * 12;
    const r = apr / 12;
    const basePi = r > 0 ? (loan * (r * Math.pow(1 + r, nMax))) / (Math.pow(1 + r, nMax) - 1) : loan / nMax;

    let bal = loan;
    let totalInterest = 0;
    let months = 0;
    const yearly = [];
    let yrPrin = 0;
    let yrInt = 0;

    while (bal > 0.01 && months < nMax) {
      months++;
      const interest = bal * r;
      let principal = (basePi - interest) + extraMonthly;
      if (principal > bal) principal = bal;
      bal -= principal;
      totalInterest += interest;
      yrPrin += principal;
      yrInt += interest;

      if (months % 12 === 0 || bal <= 0.01) {
        yearly.push({
          year: Math.ceil(months / 12),
          principal: yrPrin,
          interest: yrInt,
          balance: Math.max(0, bal),
          equity: Math.max(0, price - Math.max(0, bal))
        });
        yrPrin = 0;
        yrInt = 0;
      }
    }
    return { basePi, totalInterest, months, yearly };
  }

  function updateMortgage() {
    const price = Math.max(0, Number($("mtgPrice").value) || 0);
    const downPct = Math.min(90, Math.max(0, Number($("mtgDownPct").value) || 0));
    const apr = Math.max(0, Number($("mtgRate").value) || 0) / 100;
    const termYears = Number($("mtgTerm").value) || 30;
    const extraInput = Math.max(0, Number($("mtgExtraMonthly").value) || 0);
    const isBiweekly = $("mtgBiweekly").checked;
    const propTaxRate = Math.max(0, Number($("mtgTaxRate").value) || 0) / 100;
    const annualIns = Math.max(0, Number($("mtgIns").value) || 0);
    const hoa = Math.max(0, Number($("mtgHoa").value) || 0);

    $("mtgPriceHint").textContent = fmtUSD(price);

    const downDollar = price * (downPct / 100);
    const loan = Math.max(0, price - downDollar);
    const stdSim = simAmortization(loan, apr, termYears, 0, price);
    const biweeklyExtra = isBiweekly ? stdSim.basePi / 12 : 0;
    const totalExtra = extraInput + biweeklyExtra;
    const accelSim = simAmortization(loan, apr, termYears, totalExtra, price);
    lastMtgSchedule = accelSim.yearly;

    const monthlyTax = (price * propTaxRate) / 12;
    const monthlyIns = annualIns / 12;
    const pmi = downPct < 20 ? (loan * 0.0065) / 12 : 0;
    const totalMonthly = stdSim.basePi + monthlyTax + monthlyIns + hoa + pmi;
    const recIncome = (totalMonthly * 12) / 0.28;

    $("mtgMonthlyTotal").textContent = fmtUSD(totalMonthly);
    $("mtgLoanSub").textContent = `Loan amount: ${fmtUSD(loan)} (${termYears}-yr fixed at ${(apr * 100).toFixed(2)}%)`;
    $("mtgDownDollar").textContent = fmtUSD(downDollar);
    $("mtgTotalInterest").textContent = fmtUSD(stdSim.totalInterest);
    $("mtgRecIncome").textContent = `${fmtUSD(recIncome)}/yr`;

    // Early Payoff Reward Banner
    const monthsSaved = Math.max(0, stdSim.months - accelSim.months);
    const interestSaved = Math.max(0, stdSim.totalInterest - accelSim.totalInterest);
    if (totalExtra > 0 && monthsSaved > 0) {
      const yrsSaved = Math.floor(monthsSaved / 12);
      const remMos = monthsSaved % 12;
      const timeTxt = yrsSaved > 0 ? `${yrsSaved} yr${yrsSaved > 1 ? "s" : ""} ${remMos} mo${remMos !== 1 ? "s" : ""}` : `${remMos} months`;
      $("mtgEarlyRewardBox").innerHTML = `<strong>Early Payoff Impact (+${fmtUSD(totalExtra)}/mo):</strong> You shorten your mortgage by <span class="compare-delta">${timeTxt}</span> and save <span class="compare-delta">${fmtUSD(interestSaved)}</span> in total interest. Tip: instruct your lender to apply extra payments to <strong>Principal Only</strong>.`;
    } else {
      $("mtgEarlyRewardBox").innerHTML = `<strong>Payoff Accelerator:</strong> Try adding $200/mo extra principal or toggling Biweekly Payments to see how many years and tens of thousands in interest you can wipe out.`;
    }

    // Stacked PITI Meter
    const parts = [
      { v: stdSim.basePi, c: "var(--accent-emerald)" },
      { v: monthlyTax, c: "var(--accent-navy)" },
      { v: monthlyIns, c: "var(--accent-amber)" },
      { v: pmi + hoa, c: "var(--accent-slate)" }
    ];
    const sumP = parts.reduce((s, p) => s + p.v, 0) || 1;
    $("mtgPitiBar").innerHTML = parts.map((p) => `<span style="width:${((p.v / sumP) * 100).toFixed(1)}%; background:${p.c};"></span>`).join("");

    $("mtgBreakdownBody").innerHTML = `
      <tr><td><span class="swatch" style="background:var(--accent-emerald);"></span>Principal &amp; Interest</td><td class="tabular">${fmtUSD(stdSim.basePi)}</td></tr>
      <tr><td><span class="swatch" style="background:var(--accent-navy);"></span>Property Tax (${(propTaxRate * 100).toFixed(1)}%)</td><td class="tabular">${fmtUSD(monthlyTax)}</td></tr>
      <tr><td><span class="swatch" style="background:var(--accent-amber);"></span>Homeowners Insurance</td><td class="tabular">${fmtUSD(monthlyIns)}</td></tr>
      ${pmi > 0 ? `<tr><td><span class="swatch" style="background:var(--accent-slate);"></span>Est. PMI (&lt;20% down)</td><td class="tabular">${fmtUSD(pmi)}</td></tr>` : ""}
      ${hoa > 0 ? `<tr><td><span class="swatch" style="background:#94A3B8;"></span>HOA Dues</td><td class="tabular">${fmtUSD(hoa)}</td></tr>` : ""}
      <tr><td>Total Monthly PITI</td><td class="tabular">${fmtUSD(totalMonthly)}</td></tr>
    `;

    const pmiNote = pmi > 0
      ? `Because your down payment is under 20%, you pay about <strong>${fmtUSD(pmi)}/mo</strong> in PMI until reaching 20% equity.`
      : `Your 20%+ down payment eliminates Private Mortgage Insurance (PMI), saving roughly $150 to $300 every month.`;
    $("mtgInsightBox").innerHTML = `<strong>Affordability Check (28% Rule):</strong> Lenders recommend keeping total housing costs at or below 28% of gross income (<strong>${fmtUSD(recIncome)}/yr</strong> household income for this home). ${pmiNote}`;

    $("mtgScheduleBody").innerHTML = accelSim.yearly.map((r) => `
      <tr>
        <td>Year ${r.year}</td>
        <td>${fmtUSD(r.principal)}</td>
        <td>${fmtUSD(r.interest)}</td>
        <td>${fmtUSD(r.balance)}</td>
        <td><strong>${fmtUSD(r.equity)}</strong></td>
      </tr>
    `).join("");

    if (activeTool === "mortgage") {
      lastSummaryText = `SmartMoney US Mortgage: ${fmtUSD(price)} home (${downPct}% down, ${(apr * 100).toFixed(2)}% APR, ${termYears}yr) -> ${fmtUSD(totalMonthly)}/mo PITI. Extra payments save ${fmtUSD(interestSaved)}.`;
    }
  }

  /* TOOL 4: AUTO LOAN + TERM COMPARISON */
  function calcAutoTerm(financed, apr, months) {
    const r = apr / 12;
    const monthly = r > 0 ? (financed * (r * Math.pow(1 + r, months))) / (Math.pow(1 + r, months) - 1) : financed / months;
    const totalInterest = Math.max(0, monthly * months - financed);
    return { monthly, totalInterest };
  }

  function updateAuto() {
    const price = Math.max(0, Number($("autoPrice").value) || 0);
    const down = Math.max(0, Number($("autoDown").value) || 0);
    const apr = Math.max(0, Number($("autoApr").value) || 0) / 100;
    const months = Number($("autoMonths").value) || 48;
    const taxRate = Math.max(0, Number($("autoTax").value) || 0) / 100;
    const grossMo = Math.max(1, Number($("autoMonthlyIncome").value) || 1);

    const taxedPrice = price * (1 + taxRate);
    const financed = Math.max(0, taxedPrice - down);
    const cur = calcAutoTerm(financed, apr, months);
    const incomePct = (cur.monthly / grossMo) * 100;
    const downPct = price > 0 ? (down / price) * 100 : 0;

    $("autoMonthly").textContent = fmtUSD(cur.monthly);
    $("autoTotalSub").textContent = `Out-the-door + interest (${months} mo): ${fmtUSD(cur.monthly * months + down)}`;
    $("autoFinanced").textContent = fmtUSD(financed);
    $("autoInterest").textContent = fmtUSD(cur.totalInterest);
    $("autoIncomePct").textContent = fmtPct(incomePct);

    const passDown = downPct >= 20;
    const passTerm = months <= 48;
    const passIncome = incomePct <= 10;

    $("autoRuleGrid").innerHTML = `
      <div class="pillar-card ${passDown ? "" : "is-warn"}">
        <strong>20% Down: ${Math.round(downPct)}%</strong>
        <span>${passDown ? "Passes target (>=20%)" : "Below 20% down target"}</span>
      </div>
      <div class="pillar-card ${passTerm ? "" : "is-warn"}">
        <strong>4-Yr Max: ${months} mo</strong>
        <span>${passTerm ? "Passes target (<=48m)" : "Longer than 48 months"}</span>
      </div>
      <div class="pillar-card ${passIncome ? "" : "is-warn"}">
        <strong>10% Cap: ${fmtPct(incomePct)}</strong>
        <span>${passIncome ? "Fits safely under 10%" : "Exceeds 10% income cap"}</span>
      </div>
    `;

    const base48 = calcAutoTerm(financed, apr, 48);
    const terms = [36, 48, 60, 72];
    $("autoTermCompareBody").innerHTML = terms.map((t) => {
      const m = calcAutoTerm(financed, apr, t);
      const diff = m.totalInterest - base48.totalInterest;
      const diffTxt = t === 48 ? "Baseline" : (diff > 0 ? `+${fmtUSD(diff)}` : fmtUSD(diff));
      const badge = t <= 48
        ? `<span class="status-pill pass">Recommended</span>`
        : `<span class="status-pill warn">High Interest</span>`;
      return `
        <tr class="${t === months ? "is-active-row" : ""}">
          <td>${t} Months (${t / 12} yrs)${t === months ? " · Selected" : ""}</td>
          <td>${fmtUSD(m.monthly)}/mo</td>
          <td>${fmtUSD(m.totalInterest)}</td>
          <td>${diffTxt}</td>
          <td>${badge}</td>
        </tr>
      `;
    }).join("");

    const m72 = calcAutoTerm(financed, apr, 72);
    $("autoInsightBox").innerHTML = `<strong>Buyer's Edge:</strong> Stretching this loan to 72 months costs <strong>${fmtUSD(m72.totalInterest - base48.totalInterest)}</strong> more in pure interest than a 48-month loan, while putting you at risk of owing more than the car is worth.`;

    if (activeTool === "auto") {
      lastSummaryText = `SmartMoney US Auto Loan: ${fmtUSD(price)} car (${months}mo @ ${(apr * 100).toFixed(2)}%) -> ${fmtUSD(cur.monthly)}/mo (${fmtPct(incomePct)} of monthly income).`;
    }
  }

  /* TOOL 5: 1099 FREELANCE QUARTERLY TAX */
  function updateFreelance() {
    const rev = Math.max(0, Number($("flRevenue").value) || 0);
    const baseExp = Math.max(0, Number($("flExpenses").value) || 0);
    const homeOffice = Math.max(0, Number($("flHomeOffice").value) || 0);
    const gear = Math.max(0, Number($("flGear").value) || 0);
    const miles = Math.max(0, Number($("flMiles").value) || 0);
    const mileageDed = miles * 0.70;
    const totalExp = baseExp + homeOffice + gear + mileageDed;

    const stateCode = $("flState").value;
    const filing = $("flFiling").value;

    const netProfit = Math.max(0, rev - totalExp);
    const seBase = netProfit * 0.9235;
    const ssPart = Math.min(seBase, TAX.fica.socialSecurityWageCap) * 0.124;
    const medPart = seBase * 0.029;
    const seTax = ssPart + medPart;
    const halfSeDed = seTax / 2;

    const stdDed = TAX.standardDeduction[filing] || 15000;
    const qbiDed = Math.max(0, (netProfit - halfSeDed) * 0.20);
    const fedTaxable = Math.max(0, netProfit - halfSeDed - stdDed - qbiDed);
    const fedTax = calcFederalDetails(fedTaxable, filing).totalTax;

    const stateTaxable = Math.max(0, netProfit - halfSeDed - Math.min(stdDed, 10000));
    const { tax: stateTax, state: stObj } = calcStateTax(stateTaxable, stateCode);

    const totalTax = seTax + fedTax + stateTax;
    const quarterly = totalTax / 4;
    const annualNet = Math.max(0, netProfit - totalTax);
    const savePct = rev > 0 ? (totalTax / rev) * 100 : 0;

    $("flQuarterly").textContent = fmtUSD(quarterly);
    $("flAnnualNetSub").textContent = `Net Profit After All Taxes: ${fmtUSD(annualNet)} / yr (${fmtUSD(annualNet / 12)} / mo)`;
    $("flProfit").textContent = fmtUSD(netProfit);
    $("flSeTax").textContent = fmtUSD(seTax);
    $("flSavePct").textContent = fmtPct(savePct);

    $("flBreakdownBody").innerHTML = `
      <tr><td><span class="swatch" style="background:var(--accent-emerald);"></span>Total Business Write-Offs (incl. ${fmtUSD(mileageDed)} mileage)</td><td class="tabular">-${fmtUSD(totalExp)}</td></tr>
      <tr><td><span class="swatch" style="background:var(--accent-slate);"></span>Self-Employment Tax (15.3% on 92.35%)</td><td class="tabular">${fmtUSD(seTax)}</td></tr>
      <tr><td><span class="swatch" style="background:var(--accent-navy);"></span>Federal Income Tax (after ${fmtUSD(qbiDed)} QBI 20% ded.)</td><td class="tabular">${fmtUSD(fedTax)}</td></tr>
      <tr><td><span class="swatch" style="background:var(--accent-amber);"></span>${stObj.name} State Tax</td><td class="tabular">${fmtUSD(stateTax)}</td></tr>
      <tr><td>Total Annual Estimated Tax</td><td class="tabular">${fmtUSD(totalTax)}</td></tr>
    `;

    $("flInsightBox").innerHTML = `<strong>Safe-Harbor Strategy:</strong> Auto-transfer <strong>${Math.ceil(savePct)}%</strong> of every client invoice into a separate High-Yield Savings Account so your <strong>${fmtUSD(quarterly)}</strong> quarterly IRS payment is always ready (and earns interest until due).`;

    const dueDates = [
      { q: "Q1 Payment", date: "Apr 15, 2026", period: "Jan 1 to Mar 31 income" },
      { q: "Q2 Payment", date: "Jun 15, 2026", period: "Apr 1 to May 31 income" },
      { q: "Q3 Payment", date: "Sep 15, 2026", period: "Jun 1 to Aug 31 income" },
      { q: "Q4 Payment", date: "Jan 15, 2027", period: "Sep 1 to Dec 31 income" }
    ];
    $("flDueDatesGrid").innerHTML = dueDates.map((d) => `
      <div class="due-card">
        <div class="due-q">${d.q}</div>
        <div class="due-date">${d.date}</div>
        <div class="due-amt tabular">${fmtUSD(quarterly)}</div>
        <div class="due-period">${d.period}</div>
      </div>
    `).join("");

    if (activeTool === "freelance") {
      lastSummaryText = `SmartMoney US 1099 Tax (${stObj.name}): ${fmtUSD(netProfit)} profit -> Set aside ${fmtUSD(quarterly)}/quarter (${fmtUSD(totalTax)}/yr total tax).`;
    }
  }

  /* Quick Presets Bar */
  function renderPresets() {
    const list = PRESETS[activeTool] || [];
    $("quickPresetsRow").innerHTML = list.map((p, idx) =>
      `<button type="button" class="preset-chip" data-preset-idx="${idx}">${p.label}</button>`
    ).join("");

    $("quickPresetsRow").querySelectorAll(".preset-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const preset = list[Number(btn.dataset.presetIdx)];
        if (!preset) return;
        Object.entries(preset.set).forEach(([id, val]) => {
          const el = $(id);
          if (!el) return;
          if (el.type === "checkbox") el.checked = Boolean(val);
          else el.value = val;
        });
        syncSlidersFromInputs();
        recalcAll();
        saveInputs();
        showToast(`Loaded scenario: ${preset.label}`);
      });
    });
  }

  /* Contextual Affiliates & Ecosystem Links */
  function renderOffers() {
    const matched = CONFIG.affiliates.filter((a) => a.context.includes(activeTool));
    const displayList = matched.length >= 3 ? matched.slice(0, 3) : CONFIG.affiliates.slice(0, 3);

    $("offersGrid").innerHTML = displayList.map((offer) => {
      const hasUrl = Boolean(offer.url && offer.url.trim());
      const btnHtml = hasUrl
        ? `<a class="btn btn-primary btn-sm" href="${offer.url}" target="_blank" rel="noopener noreferrer sponsored">${offer.ctaLabel}</a>`
        : `<button type="button" class="btn btn-sm" disabled title="Add affiliate URL in config.js">Partner Link Coming Soon</button>`;

      return `
        <article class="offer-card">
          <div>
            <span class="offer-badge">${offer.badge}</span>
            <h3>${offer.title}</h3>
            <p>${offer.summary}</p>
          </div>
          <div>${btnHtml}</div>
        </article>
      `;
    }).join("");

    const ecoItems = [
      CONFIG.ecosystem.youtubeFinance,
      CONFIG.ecosystem.gumroadSheets
    ];

    $("ecoLinksContainer").innerHTML = ecoItems.map((item) => {
      const hasUrl = Boolean(item.url && item.url.trim());
      if (hasUrl) {
        return `<a class="btn btn-sm btn-primary" href="${item.url}" target="_blank" rel="noopener noreferrer">${item.label}</a>`;
      }
      return `<button type="button" class="btn btn-sm" disabled title="Add URL in config.js">${item.label} (Soon)</button>`;
    }).join("");

    // Render Contextual In-Result CTA (SmartAsset / NerdWallet pattern -> AGY 5 SP #2 slot)
    const sheetOffer = CONFIG.ecosystem.gumroadSheets;
    const hasSheetUrl = Boolean(sheetOffer.url && sheetOffer.url.trim());
    document.querySelectorAll("[data-result-cta]").forEach((box) => {
      const toolKey = box.dataset.resultCta;
      const copy = RESULT_CTA_COPY[toolKey] || RESULT_CTA_COPY.paycheck;
      const ctaControl = hasSheetUrl
        ? `<a class="btn btn-primary btn-sm" href="${sheetOffer.url}" target="_blank" rel="noopener noreferrer">${sheetOffer.label}</a>`
        : `<button type="button" class="btn btn-sm" disabled title="Slot ready for AGY 5 SP #2 in config.js">US Finance &amp; Wealth OS (Soon)</button>`;
      box.innerHTML = `
        <div class="result-cta-copy">
          <strong>${copy.title}</strong>
          <p>${copy.desc}</p>
        </div>
        <div class="result-cta-action">${ctaControl}</div>
      `;
    });
  }

  function switchTool(toolId, updateHash) {
    if (!TOOL_META[toolId]) toolId = "paycheck";
    activeTool = toolId;

    document.querySelectorAll(".tool-tab").forEach((btn) => {
      btn.setAttribute("aria-selected", String(btn.dataset.tool === toolId));
    });
    document.querySelectorAll(".calc-panel").forEach((panel) => {
      panel.hidden = panel.id !== "panel-" + toolId;
    });

    $("activeToolHeading").textContent = TOOL_META[toolId].title;
    $("activeToolDesc").textContent = TOOL_META[toolId].desc;

    if (updateHash) history.replaceState(null, "", "#" + toolId);

    renderPresets();
    recalcAll();
    renderOffers();
  }

  function recalcAll() {
    updatePaycheck();
    updateCompound();
    updateMortgage();
    updateAuto();
    updateFreelance();
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (_) {}
    $("themeToggleBtn").textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
  }

  function init() {
    $("brandNameText").textContent = CONFIG.brand.name;
    $("brandSubText").textContent = CONFIG.brand.subtitle;

    const buildStateOpts = (defaultCode) => TAX.states.map((s) =>
      `<option value="${s.code}" ${s.code === defaultCode ? "selected" : ""}>${s.name} (${s.code})${s.type === "none" ? " - 0% Tax" : ""}</option>`
    ).join("");
    $("payState").innerHTML = buildStateOpts("CA");
    $("payCompareState").innerHTML = buildStateOpts("TX");
    $("flState").innerHTML = buildStateOpts("CA");

    restoreInputs();
    const urlTab = applyUrlParams();
    syncSlidersFromInputs();
    applyTheme(localStorage.getItem(THEME_KEY) || "light");

    document.querySelectorAll(".tool-tab").forEach((btn) => {
      btn.addEventListener("click", () => switchTool(btn.dataset.tool, true));
    });

    $("themeToggleBtn").addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") || "light";
      applyTheme(cur === "dark" ? "light" : "dark");
    });

    $("shareLinkBtn").addEventListener("click", () => {
      const shareUrl = buildShareUrl();
      history.replaceState(null, "", shareUrl);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          showToast("Shareable link copied to clipboard!");
        }).catch(() => showToast("Share link updated in address bar."));
      } else {
        showToast("Share link updated in address bar.");
      }
    });

    $("copyScenarioBtn").addEventListener("click", () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(lastSummaryText).then(() => {
          showToast("Result summary copied to clipboard.");
        }).catch(() => showToast(lastSummaryText));
      } else {
        showToast(lastSummaryText);
      }
    });

    $("printReportBtn").addEventListener("click", () => window.print());

    $("resetDefaultsBtn").addEventListener("click", () => {
      try { localStorage.removeItem(STATE_KEY); } catch (_) {}
      window.location.reload();
    });

    $("cmpExportCsvBtn").addEventListener("click", () => {
      downloadCsv(
        "smartmoney-us-compound-schedule.csv",
        ["Year", "Total Contributed ($)", "Yearly Interest ($)", "Ending Balance ($)", "Inflation-Adjusted Balance ($)"],
        lastCmpSchedule.map((r) => [r.year, Math.round(r.principal), Math.round(r.yrInterest), Math.round(r.total), Math.round(r.realTotal)])
      );
    });

    $("mtgExportCsvBtn").addEventListener("click", () => {
      downloadCsv(
        "smartmoney-us-mortgage-amortization.csv",
        ["Year", "Principal Paid ($)", "Interest Paid ($)", "Remaining Balance ($)", "Home Equity ($)"],
        lastMtgSchedule.map((r) => [r.year, Math.round(r.principal), Math.round(r.interest), Math.round(r.balance), Math.round(r.equity)])
      );
    });

    const bind = (id, fn) => {
      const el = $(id);
      if (!el) return;
      const handler = () => { fn(); saveInputs(); };
      el.addEventListener("input", handler);
      el.addEventListener("change", handler);
    };

    $("paySalary").addEventListener("input", (e) => {
      $("paySalarySlider").value = Math.min(350000, Math.max(25000, Number(e.target.value) || 25000));
      updatePaycheck();
      saveInputs();
    });
    $("paySalarySlider").addEventListener("input", (e) => {
      $("paySalary").value = e.target.value;
      updatePaycheck();
      saveInputs();
    });
    ["payState", "payCompareState", "payFiling", "payFreq", "pay401k", "payHsa", "payHealth"].forEach((id) => bind(id, updatePaycheck));

    $("cmpYears").addEventListener("input", (e) => {
      $("cmpYearsSlider").value = Math.min(45, Math.max(1, Number(e.target.value) || 1));
      updateCompound();
      saveInputs();
    });
    $("cmpYearsSlider").addEventListener("input", (e) => {
      $("cmpYears").value = e.target.value;
      updateCompound();
      saveInputs();
    });
    ["cmpInitial", "cmpMonthly", "cmpRate", "cmpInflation", "cmpCompareMode"].forEach((id) => bind(id, updateCompound));
    document.querySelectorAll("[data-cmp-rate]").forEach((btn) => {
      btn.addEventListener("click", () => {
        $("cmpRate").value = btn.dataset.cmpRate;
        updateCompound();
        saveInputs();
      });
    });

    $("mtgPrice").addEventListener("input", (e) => {
      $("mtgPriceSlider").value = Math.min(1500000, Math.max(150000, Number(e.target.value) || 150000));
      updateMortgage();
      saveInputs();
    });
    $("mtgPriceSlider").addEventListener("input", (e) => {
      $("mtgPrice").value = e.target.value;
      updateMortgage();
      saveInputs();
    });
    ["mtgDownPct", "mtgRate", "mtgTerm", "mtgExtraMonthly", "mtgBiweekly", "mtgTaxRate", "mtgIns", "mtgHoa"].forEach((id) => bind(id, updateMortgage));

    ["autoPrice", "autoDown", "autoApr", "autoMonths", "autoTax", "autoMonthlyIncome"].forEach((id) => bind(id, updateAuto));
    ["flRevenue", "flExpenses", "flState", "flFiling", "flHomeOffice", "flGear", "flMiles"].forEach((id) => bind(id, updateFreelance));

    const initialHash = (window.location.hash || "").replace("#", "");
    const startTab = urlTab || (TOOL_META[initialHash] ? initialHash : "paycheck");
    switchTool(startTab, false);
  }

  init();
})();
