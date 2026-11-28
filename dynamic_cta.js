/**
 * Dynamic Result-Driven CTA Engine (V28 CRO Standard — Type 0 for Free Lite)
 * Personalizes inline Gumroad CTAs with live calculated numbers + exact UTM + GoatCounter event:true.
 */
(function () {
  "use strict";
  const UTM = "?utm_source=web&utm_medium=smartmoney&utm_campaign=v28-result-cta";
  const RULES = [
    {
      slot: "paycheck",
      id: "payPrimaryValue",
      tpl: "Budget your {val} take-home pay on autopilot",
      sub: "Type 0 for Free Lite ($0) · Optional $19 Full — 50/30/20 Google Sheet OS.",
      btn: "Get $0 Free Lite &rarr;",
      url: "https://897833387907.gumroad.com/l/us-personal-finance-wealth-os-2026" + UTM
    },
    {
      slot: "compound",
      id: "cmpFinalValue",
      tpl: "Track your path to {val} in 1 Google Sheet",
      sub: "Type 0 for Free Lite ($0) · Optional $19 Full — Live Net Worth & FIRE tracker.",
      btn: "Get $0 Free Lite &rarr;",
      url: "https://897833387907.gumroad.com/l/us-personal-finance-wealth-os-2026" + UTM
    },
    {
      slot: "mortgage",
      id: "mtgMonthlyTotal",
      tpl: "Fit this {val}/mo PITI into your 50/30/20 budget",
      sub: "Type 0 for Free Lite ($0) · Optional $19 Full — Home equity & payoff tracker.",
      btn: "Get $0 Free Lite &rarr;",
      url: "https://897833387907.gumroad.com/l/us-personal-finance-wealth-os-2026" + UTM
    },
    {
      slot: "auto",
      id: "autoMonthly",
      tpl: "Keep this {val}/mo car note under 10% of pay",
      sub: "Type 0 for Free Lite ($0) · Optional $19 Full — Automated monthly cash-flow OS.",
      btn: "Get $0 Free Lite &rarr;",
      url: "https://897833387907.gumroad.com/l/us-personal-finance-wealth-os-2026" + UTM
    },
    {
      slot: "freelance",
      id: "flQuarterly",
      tpl: "Automate your {val}/quarter IRS 1040-ES vault",
      sub: "Type 0 for Free Lite ($0) · Optional $24 Full — Schedule C + mileage + P&L Sheet.",
      btn: "Get $0 Free Lite &rarr;",
      url: "https://897833387907.gumroad.com/l/us-freelancer-1099-tax-pnl-os-2026" + UTM
    }
  ];

  function syncRule(rule) {
    const src = document.getElementById(rule.id);
    const box = document.querySelector('[data-result-cta="' + rule.slot + '"]');
    if (!src || !box) return;
    const raw = (src.textContent || "").trim();
    if (!raw) return;
    const headline = rule.tpl.replace("{val}", raw);
    if (box.dataset.lastDynamicHeadline === headline) return;
    box.dataset.lastDynamicHeadline = headline;
    box.innerHTML =
      '<div class="result-cta-copy">' +
        '<strong>' + headline + '</strong>' +
        '<span style="display:block;font-size:0.8rem;color:var(--text-secondary);margin-top:0.15rem;">' + rule.sub + '</span>' +
      '</div>' +
      '<div class="result-cta-action" style="flex-shrink:0;">' +
        '<a class="btn btn-primary btn-sm" href="' + rule.url + '" data-v28-cta="' + rule.slot + '" target="_blank" rel="noopener noreferrer">' + rule.btn + '</a>' +
      '</div>';
  }

  function syncAll() {
    RULES.forEach(syncRule);
  }

  function bindTracking() {
    if (window.__sp03V28CtaBound) return;
    window.__sp03V28CtaBound = true;
    document.addEventListener("click", function (ev) {
      const a = ev.target && ev.target.closest ? ev.target.closest("a[data-v28-cta]") : null;
      if (!a) return;
      const slot = a.getAttribute("data-v28-cta") || "paycheck";
      if (window.goatcounter && typeof window.goatcounter.count === "function") {
        window.goatcounter.count({
          path: "click/us-smart-money-calculators/v28-result-cta-" + slot,
          title: "SP03 V28 Result CTA (" + slot + ")",
          event: true
        });
      }
    }, true);
  }

  function boot() {
    bindTracking();
    syncAll();
    const obs = new MutationObserver(syncAll);
    RULES.forEach(function (r) {
      const el = document.getElementById(r.id);
      if (el) obs.observe(el, { childList: true, characterData: true, subtree: true });
    });
    document.addEventListener("input", function () { setTimeout(syncAll, 20); });
    document.addEventListener("change", function () { setTimeout(syncAll, 20); });
    document.addEventListener("click", function () { setTimeout(syncAll, 40); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(boot, 50); });
  } else {
    setTimeout(boot, 50);
  }
})();
