/**
 * Dynamic Result-Driven CTA Engine (R&D Upgrade — 2026 CRO Standard)
 * Automatically personalizes inline Gumroad CTAs with the exact live numbers calculated by the user.
 */
(function () {
  "use strict";
  const RULES = [{"slot": "paycheck", "id": "payPrimaryValue", "tpl": "Budget your {val} take-home pay on autopilot", "sub": "Free $0 Lite available · Zero monthly subscriptions — 50/30/20 Google Sheet OS.", "btn": "Get Wealth OS ($0 / $19) &rarr;", "url": "https://897833387907.gumroad.com/l/us-personal-finance-wealth-os-2026"}, {"slot": "compound", "id": "cmpFinalValue", "tpl": "Track your path to {val} in 1 Google Sheet", "sub": "Free $0 Lite available · Zero monthly subscriptions — Live Net Worth & FIRE tracker.", "btn": "Get Wealth OS ($0 / $19) &rarr;", "url": "https://897833387907.gumroad.com/l/us-personal-finance-wealth-os-2026"}, {"slot": "mortgage", "id": "mtgMonthlyTotal", "tpl": "Fit this {val}/mo PITI into your 50/30/20 budget", "sub": "Free $0 Lite available · Zero monthly subscriptions — Home equity & payoff tracker.", "btn": "Get Wealth OS ($0 / $19) &rarr;", "url": "https://897833387907.gumroad.com/l/us-personal-finance-wealth-os-2026"}, {"slot": "auto", "id": "autoMonthly", "tpl": "Keep this {val}/mo car note under 10% of pay", "sub": "Free $0 Lite available · Zero monthly subscriptions — Automated monthly cash-flow OS.", "btn": "Get Wealth OS ($0 / $19) &rarr;", "url": "https://897833387907.gumroad.com/l/us-personal-finance-wealth-os-2026"}, {"slot": "freelance", "id": "flQuarterly", "tpl": "Automate your {val}/quarter IRS 1040-ES vault", "sub": "Free $0 Lite available · Zero monthly subscriptions — Schedule C + mileage + P&L Sheet.", "btn": "Get 1099 Tax OS ($0 / $24) &rarr;", "url": "https://897833387907.gumroad.com/l/us-freelancer-1099-tax-pnl-os-2026"}];

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
        '<a class="btn btn-primary btn-sm" href="' + rule.url + '" target="_blank" rel="noopener noreferrer">' + rule.btn + '</a>' +
      '</div>';
  }

  function syncAll() {
    RULES.forEach(syncRule);
  }

  function boot() {
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
