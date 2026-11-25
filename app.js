(function () {
  "use strict";

  const THEME_KEY = "smartmoney_us_theme_v1";
  const TAX = window.US_TAX_DATA;
  const CONFIG = window.SMARTMONEY_CONFIG;

  const TOOL_META = {
    paycheck: {
      title: "2026 US Paycheck & 50-State Take-Home Calculator",
      desc: "Estimate your exact net pay after 2026 Federal income brackets, Social Security, Medicare, 401(k) contributions, and state taxes across all 50 states and DC."
    },
    compound: {
      title: "Compound Interest & S&P 500 Wealth Calculator",
      desc: "See how consistent monthly investing compounds over 10, 20, or 30 years across high-yield savings, index ETFs, and growth stocks."
    },
    mortgage: {
      title: "US Mortgage & Monthly PITI Calculator",
      desc: "Calculate your real monthly housing cost including Principal, Interest, Property Taxes, Homeowners Insurance, and HOA dues."
    },
    auto: {
      title: "US Auto Loan & 20/4/10 Affordability Calculator",
      desc: "Find your monthly vehicle payment with sales tax and trade-in credit, then check whether the loan passes the 20/4/10 rule."
    },
    freelance: {
      title: "2026 US 1099 Freelance & Quarterly Tax Estimator",
      desc: "Calculate Self-Employment tax (15.3%), federal and state income tax, and exactly how much to set aside each quarter for the IRS."
    }
  };

  let activeTool = "paycheck";
  let lastSummaryText = "";
  let toastTimer = null;

  const $ = (id) => document.getElementById(id);

  function fmtUSD(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
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

  /* Federal Progressive Tax Engine (2026) */
  function calcFederalTax(taxableIncome, filingStatus) {
    const income = Math.max(0, taxableIncome);
    const brackets = TAX.federalBrackets[filingStatus] || TAX.federalBrackets.single;
    let tax = 0;
    let prev = 0;
    for (const b of brackets) {
      if (income <= prev) break;
      const slice = Math.min(income, b.upTo) - prev;
      tax += slice * b.rate;
      prev = b.upTo;
    }
    return tax;
  }

  /* State Tax Estimator across 50 States + DC */
  function calcStateTax(taxableIncome, stateCode) {
    const st = TAX.states.find((s) => s.code === stateCode) || TAX.states[0];
    const income = Math.max(0, taxableIncome);
    if (st.type === "none" || income <= 0) return { tax: 0, state: st };
    if (st.type === "flat") return { tax: income * st.baseRate, state: st };
    // Progressive state approximation blending base effective rate toward top marginal rate at high incomes
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

  /* Render Multi-Segment SVG Donut */
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

  /* TOOL 1: PAYCHECK */
  function updatePaycheck() {
    const salary = Math.max(0, Number($("paySalary").value) || 0);
    const stateCode = $("payState").value;
    const filing = $("payFiling").value;
    const freq = Number($("payFreq").value) || 26;
    const k401Pct = Math.min(50, Math.max(0, Number($("pay401k").value) || 0));
    const health = Math.max(0, Number($("payHealth").value) || 0);

    $("paySalaryHint").textContent = `${fmtUSD(salary)} / yr`;
    $("pay401kHint").textContent = `${k401Pct}%`;

    const k401 = Math.min(23500, salary * (k401Pct / 100));
    const stdDed = TAX.standardDeduction[filing] || 15000;
    const fedTaxable = Math.max(0, salary - k401 - health - stdDed);
    const fedTax = calcFederalTax(fedTaxable, filing);

    const stateTaxable = Math.max(0, salary - k401 - health - Math.min(stdDed, 10000));
    const { tax: stateTax, state: stObj } = calcStateTax(stateTaxable, stateCode);

    const fica = calcFica(Math.max(0, salary - health), filing);
    const totalTax = fedTax + stateTax + fica;
    const annualNet = Math.max(0, salary - totalTax - k401 - health);

    const perCheck = annualNet / freq;
    const freqNames = { 26: "Bi-Weekly", 24: "Semi-Monthly", 12: "Monthly", 52: "Weekly", 1: "Annual" };
    $("payPrimaryLabel").textContent = `Estimated ${freqNames[freq] || ""} Take-Home Pay`;
    $("payPrimaryValue").textContent = fmtUSD(perCheck);
    $("payAnnualSub").textContent = `Annual Net Pay: ${fmtUSD(annualNet)} (Gross: ${fmtUSD(salary)})`;

    $("payStateBadge").textContent = stObj.type === "none"
      ? `${stObj.code}: No State Income Tax`
      : `${stObj.code}: ${stObj.type === "flat" ? "Flat" : "Progressive"} State Tax`;

    const effTaxPct = salary > 0 ? (totalTax / salary) * 100 : 0;
    const keepPct = salary > 0 ? (annualNet / salary) * 100 : 0;
    $("payEffTax").textContent = fmtPct(effTaxPct);
    $("payMonthlyNet").textContent = fmtUSD(annualNet / 12);
    $("payHourlyNet").textContent = `${fmtUSD(annualNet / 2080)}/hr`;
    $("payKeepPct").textContent = `${Math.round(keepPct)}%`;

    renderDonut($("payDonutSvg"), [
      { value: annualNet, color: "var(--accent-emerald)" },
      { value: fedTax, color: "var(--accent-navy)" },
      { value: stateTax, color: "var(--accent-amber)" },
      { value: fica, color: "var(--accent-slate)" },
      { value: k401 + health, color: "#94A3B8" }
    ]);

    $("payBreakdownBody").innerHTML = `
      <tr><td><span class="swatch" style="background:var(--accent-emerald);"></span>Net Take-Home Pay</td><td class="tabular">${fmtUSD(annualNet)}</td></tr>
      <tr><td><span class="swatch" style="background:var(--accent-navy);"></span>Federal Income Tax</td><td class="tabular">-${fmtUSD(fedTax)}</td></tr>
      <tr><td><span class="swatch" style="background:var(--accent-amber);"></span>${stObj.name} State Tax</td><td class="tabular">-${fmtUSD(stateTax)}</td></tr>
      <tr><td><span class="swatch" style="background:var(--accent-slate);"></span>FICA (Social Security &amp; Medicare)</td><td class="tabular">-${fmtUSD(fica)}</td></tr>
      <tr><td><span class="swatch" style="background:#94A3B8;"></span>401(k) &amp; Health Pre-Tax</td><td class="tabular">-${fmtUSD(k401 + health)}</td></tr>
      <tr><td>Gross Annual Salary</td><td class="tabular">${fmtUSD(salary)}</td></tr>
    `;

    if (activeTool === "paycheck") {
      lastSummaryText = `SmartMoney US (2026): ${fmtUSD(salary)} in ${stObj.name} (${filing}) -> ${fmtUSD(annualNet)}/yr net (${fmtUSD(annualNet / 12)}/mo, ${fmtPct(effTaxPct)} effective tax).`;
    }
  }

  /* TOOL 2: COMPOUND INTEREST */
  function updateCompound() {
    const initial = Math.max(0, Number($("cmpInitial").value) || 0);
    const monthly = Math.max(0, Number($("cmpMonthly").value) || 0);
    const rate = Math.max(0, Number($("cmpRate").value) || 0) / 100;
    const years = Math.min(50, Math.max(1, Number($("cmpYears").value) || 1));

    $("cmpRateHint").textContent = `${(rate * 100).toFixed(1)}%`;
    $("cmpYearsHint").textContent = `${years} years`;

    const rMonth = rate / 12;
    let balance = initial;
    let contrib = initial;
    const yearly = [];

    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) {
        balance = balance * (1 + rMonth) + monthly;
        contrib += monthly;
      }
      yearly.push({ year: y, principal: contrib, growth: Math.max(0, balance - contrib), total: balance });
    }

    const finalObj = yearly[yearly.length - 1];
    $("cmpFinalValue").textContent = fmtUSD(finalObj.total);
    $("cmpGainSub").textContent = `Compound growth earned: ${fmtUSD(finalObj.growth)} (${finalObj.total > 0 ? Math.round((finalObj.growth / finalObj.total) * 100) : 0}% of total)`;
    $("cmpPrincipal").textContent = fmtUSD(finalObj.principal);
    $("cmpInterest").textContent = fmtUSD(finalObj.growth);
    $("cmpSafeMonthly").textContent = `${fmtUSD((finalObj.total * 0.04) / 12)}/mo`;

    // Sample up to 6 clean milestone bars
    const step = Math.max(1, Math.ceil(years / 6));
    const sampled = [];
    for (let i = step - 1; i < yearly.length; i += step) sampled.push(yearly[i]);
    if (sampled[sampled.length - 1] !== finalObj) sampled.push(finalObj);

    const maxVal = finalObj.total || 1;
    $("cmpChartBars").innerHTML = sampled.map((pt) => {
      const pPct = Math.max(2, Math.round((pt.principal / maxVal) * 100));
      const gPct = Math.max(0, Math.round((pt.growth / maxVal) * 100));
      return `
        <div class="bar-col">
          <div class="bar-stack" style="height:${Math.min(100, pPct + gPct)}%;" title="Year ${pt.year}: ${fmtUSD(pt.total)}">
            <div class="bar-seg-principal" style="height:${(pt.principal / pt.total) * 100}%;"></div>
            <div class="bar-seg-growth" style="height:${(pt.growth / pt.total) * 100}%;"></div>
          </div>
          <span class="bar-yr tabular">Yr ${pt.year}</span>
        </div>
      `;
    }).join("");

    if (activeTool === "compound") {
      lastSummaryText = `SmartMoney US Compound: ${fmtUSD(initial)} start + ${fmtUSD(monthly)}/mo at ${(rate * 100).toFixed(1)}% for ${years} yrs -> ${fmtUSD(finalObj.total)} (${fmtUSD(finalObj.growth)} growth).`;
    }
  }

  /* TOOL 3: US MORTGAGE */
  function updateMortgage() {
    const price = Math.max(0, Number($("mtgPrice").value) || 0);
    const downPct = Math.min(90, Math.max(0, Number($("mtgDownPct").value) || 0));
    const apr = Math.max(0, Number($("mtgRate").value) || 0) / 100;
    const termYears = Number($("mtgTerm").value) || 30;
    const propTaxRate = Math.max(0, Number($("mtgTaxRate").value) || 0) / 100;
    const annualIns = Math.max(0, Number($("mtgIns").value) || 0);
    const hoa = Math.max(0, Number($("mtgHoa").value) || 0);

    $("mtgPriceHint").textContent = fmtUSD(price);

    const downDollar = price * (downPct / 100);
    const loan = Math.max(0, price - downDollar);
    const n = termYears * 12;
    const r = apr / 12;

    const pi = r > 0 ? (loan * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1) : loan / n;
    const monthlyTax = (price * propTaxRate) / 12;
    const monthlyIns = annualIns / 12;
    const pmi = downPct < 20 ? (loan * 0.0065) / 12 : 0;
    const totalMonthly = pi + monthlyTax + monthlyIns + hoa + pmi;
    const totalInterest = Math.max(0, pi * n - loan);
    const recIncome = (totalMonthly * 12) / 0.28;

    $("mtgMonthlyTotal").textContent = fmtUSD(totalMonthly);
    $("mtgLoanSub").textContent = `Loan amount: ${fmtUSD(loan)} (${termYears}-yr fixed at ${(apr * 100).toFixed(2)}%)`;
    $("mtgDownDollar").textContent = fmtUSD(downDollar);
    $("mtgTotalInterest").textContent = fmtUSD(totalInterest);
    $("mtgRecIncome").textContent = `${fmtUSD(recIncome)}/yr`;

    $("mtgBreakdownBody").innerHTML = `
      <tr><td><span class="swatch" style="background:var(--accent-emerald);"></span>Principal &amp; Interest</td><td class="tabular">${fmtUSD(pi)}</td></tr>
      <tr><td><span class="swatch" style="background:var(--accent-navy);"></span>Property Tax (${(propTaxRate * 100).toFixed(1)}%)</td><td class="tabular">${fmtUSD(monthlyTax)}</td></tr>
      <tr><td><span class="swatch" style="background:var(--accent-amber);"></span>Homeowners Insurance</td><td class="tabular">${fmtUSD(monthlyIns)}</td></tr>
      ${pmi > 0 ? `<tr><td><span class="swatch" style="background:var(--accent-slate);"></span>Est. PMI (&lt;20% down)</td><td class="tabular">${fmtUSD(pmi)}</td></tr>` : ""}
      ${hoa > 0 ? `<tr><td><span class="swatch" style="background:#94A3B8;"></span>HOA Dues</td><td class="tabular">${fmtUSD(hoa)}</td></tr>` : ""}
      <tr><td>Total Monthly PITI</td><td class="tabular">${fmtUSD(totalMonthly)}</td></tr>
    `;

    if (activeTool === "mortgage") {
      lastSummaryText = `SmartMoney US Mortgage: ${fmtUSD(price)} home (${downPct}% down, ${(apr * 100).toFixed(2)}% APR, ${termYears}yr) -> ${fmtUSD(totalMonthly)}/mo PITI.`;
    }
  }

  /* TOOL 4: AUTO LOAN */
  function updateAuto() {
    const price = Math.max(0, Number($("autoPrice").value) || 0);
    const down = Math.max(0, Number($("autoDown").value) || 0);
    const apr = Math.max(0, Number($("autoApr").value) || 0) / 100;
    const months = Number($("autoMonths").value) || 48;
    const taxRate = Math.max(0, Number($("autoTax").value) || 0) / 100;
    const grossMo = Math.max(1, Number($("autoMonthlyIncome").value) || 1);

    const taxedPrice = price * (1 + taxRate);
    const financed = Math.max(0, taxedPrice - down);
    const r = apr / 12;
    const monthly = r > 0 ? (financed * (r * Math.pow(1 + r, months))) / (Math.pow(1 + r, months) - 1) : financed / months;
    const totalPaid = monthly * months;
    const totalInterest = Math.max(0, totalPaid - financed);
    const incomePct = (monthly / grossMo) * 100;
    const downPct = price > 0 ? (down / price) * 100 : 0;

    $("autoMonthly").textContent = fmtUSD(monthly);
    $("autoTotalSub").textContent = `Total paid over ${months} months: ${fmtUSD(totalPaid + down)}`;
    $("autoFinanced").textContent = fmtUSD(financed);
    $("autoInterest").textContent = fmtUSD(totalInterest);
    $("autoIncomePct").textContent = fmtPct(incomePct);

    const passDown = downPct >= 20;
    const passTerm = months <= 48;
    const passIncome = incomePct <= 10;
    const ruleBox = $("autoRuleBox");

    if (passDown && passTerm && passIncome) {
      ruleBox.classList.remove("is-warn");
      ruleBox.innerHTML = `<strong>Passes the 20/4/10 Rule:</strong> ${Math.round(downPct)}% down (&ge;20%), ${months} months (&le;48), and ${fmtPct(incomePct)} of monthly gross income (&le;10%).`;
    } else {
      ruleBox.classList.add("is-warn");
      const issues = [];
      if (!passDown) issues.push(`down payment is ${Math.round(downPct)}% (aim for 20%+)`);
      if (!passTerm) issues.push(`term is ${months} months (aim for 48 or less)`);
      if (!passIncome) issues.push(`payment is ${fmtPct(incomePct)} of income (aim for 10% or less)`);
      ruleBox.innerHTML = `<strong>20/4/10 Rule Caution:</strong> ${issues.join("; ")}.`;
    }

    if (activeTool === "auto") {
      lastSummaryText = `SmartMoney US Auto Loan: ${fmtUSD(price)} car (${months}mo @ ${(apr * 100).toFixed(2)}%) -> ${fmtUSD(monthly)}/mo (${fmtPct(incomePct)} of monthly income).`;
    }
  }

  /* TOOL 5: 1099 FREELANCE TAX */
  function updateFreelance() {
    const rev = Math.max(0, Number($("flRevenue").value) || 0);
    const exp = Math.max(0, Number($("flExpenses").value) || 0);
    const stateCode = $("flState").value;
    const filing = $("flFiling").value;

    const netProfit = Math.max(0, rev - exp);
    const seBase = netProfit * 0.9235;
    const ssPart = Math.min(seBase, TAX.fica.socialSecurityWageCap) * 0.124;
    const medPart = seBase * 0.029;
    const seTax = ssPart + medPart;
    const halfSeDed = seTax / 2;

    const stdDed = TAX.standardDeduction[filing] || 15000;
    const qbiDed = Math.max(0, (netProfit - halfSeDed) * 0.20);
    const fedTaxable = Math.max(0, netProfit - halfSeDed - stdDed - qbiDed);
    const fedTax = calcFederalTax(fedTaxable, filing);

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
      <tr><td><span class="swatch" style="background:var(--accent-slate);"></span>Self-Employment Tax (15.3% on 92.35%)</td><td class="tabular">${fmtUSD(seTax)}</td></tr>
      <tr><td><span class="swatch" style="background:var(--accent-navy);"></span>Federal Income Tax (incl. 20% QBI est.)</td><td class="tabular">${fmtUSD(fedTax)}</td></tr>
      <tr><td><span class="swatch" style="background:var(--accent-amber);"></span>${stObj.name} State Tax</td><td class="tabular">${fmtUSD(stateTax)}</td></tr>
      <tr><td>Total Annual Estimated Tax</td><td class="tabular">${fmtUSD(totalTax)}</td></tr>
    `;

    if (activeTool === "freelance") {
      lastSummaryText = `SmartMoney US 1099 Tax (${stObj.name}): ${fmtUSD(netProfit)} profit -> Set aside ${fmtUSD(quarterly)}/quarter (${fmtUSD(totalTax)}/yr total tax).`;
    }
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
      CONFIG.ecosystem.gumroadSheets,
      CONFIG.ecosystem.gumroadYtOs
    ];

    $("ecoLinksContainer").innerHTML = ecoItems.map((item) => {
      const hasUrl = Boolean(item.url && item.url.trim());
      if (hasUrl) {
        return `<a class="btn btn-sm btn-primary" href="${item.url}" target="_blank" rel="noopener noreferrer">${item.label}</a>`;
      }
      return `<button type="button" class="btn btn-sm" disabled title="Add URL in config.js">${item.label} (Soon)</button>`;
    }).join("");
  }

  /* Switch Tool + Deep Link Hash */
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

    if (updateHash) {
      history.replaceState(null, "", "#" + toolId);
    }

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

  /* Theme */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    $("themeToggleBtn").textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
  }

  function init() {
    $("brandNameText").textContent = CONFIG.brand.name;
    $("brandSubText").textContent = CONFIG.brand.subtitle;

    const stateOpts = TAX.states.map((s) =>
      `<option value="${s.code}" ${s.code === "CA" ? "selected" : ""}>${s.name} (${s.code})${s.type === "none" ? " - 0% Tax" : ""}</option>`
    ).join("");
    $("payState").innerHTML = stateOpts;
    $("flState").innerHTML = stateOpts;

    applyTheme(localStorage.getItem(THEME_KEY) || "light");

    document.querySelectorAll(".tool-tab").forEach((btn) => {
      btn.addEventListener("click", () => switchTool(btn.dataset.tool, true));
    });

    $("themeToggleBtn").addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") || "light";
      applyTheme(cur === "dark" ? "light" : "dark");
    });

    $("copyScenarioBtn").addEventListener("click", () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(lastSummaryText).then(() => {
          showToast("Result summary copied to clipboard.");
        }).catch(() => {
          showToast(lastSummaryText);
        });
      } else {
        showToast(lastSummaryText);
      }
    });

    // Pair sliders & number inputs
    $("paySalary").addEventListener("input", (e) => {
      $("paySalarySlider").value = Math.min(350000, Math.max(25000, Number(e.target.value) || 25000));
      updatePaycheck();
    });
    $("paySalarySlider").addEventListener("input", (e) => {
      $("paySalary").value = e.target.value;
      updatePaycheck();
    });

    ["payState", "payFiling", "payFreq", "pay401k", "payHealth"].forEach((id) => {
      $(id).addEventListener("input", updatePaycheck);
      $(id).addEventListener("change", updatePaycheck);
    });

    $("cmpYears").addEventListener("input", (e) => {
      $("cmpYearsSlider").value = Math.min(45, Math.max(1, Number(e.target.value) || 1));
      updateCompound();
    });
    $("cmpYearsSlider").addEventListener("input", (e) => {
      $("cmpYears").value = e.target.value;
      updateCompound();
    });
    ["cmpInitial", "cmpMonthly", "cmpRate"].forEach((id) => {
      $(id).addEventListener("input", updateCompound);
    });
    document.querySelectorAll("[data-cmp-rate]").forEach((btn) => {
      btn.addEventListener("click", () => {
        $("cmpRate").value = btn.dataset.cmpRate;
        updateCompound();
      });
    });

    $("mtgPrice").addEventListener("input", (e) => {
      $("mtgPriceSlider").value = Math.min(1500000, Math.max(150000, Number(e.target.value) || 150000));
      updateMortgage();
    });
    $("mtgPriceSlider").addEventListener("input", (e) => {
      $("mtgPrice").value = e.target.value;
      updateMortgage();
    });
    ["mtgDownPct", "mtgRate", "mtgTerm", "mtgTaxRate", "mtgIns", "mtgHoa"].forEach((id) => {
      $(id).addEventListener("input", updateMortgage);
      $(id).addEventListener("change", updateMortgage);
    });

    ["autoPrice", "autoDown", "autoApr", "autoMonths", "autoTax", "autoMonthlyIncome"].forEach((id) => {
      $(id).addEventListener("input", updateAuto);
      $(id).addEventListener("change", updateAuto);
    });

    ["flRevenue", "flExpenses", "flState", "flFiling"].forEach((id) => {
      $(id).addEventListener("input", updateFreelance);
      $(id).addEventListener("change", updateFreelance);
    });

    const initialHash = (window.location.hash || "").replace("#", "");
    switchTool(TOOL_META[initialHash] ? initialHash : "paycheck", false);
  }

  init();
})();
