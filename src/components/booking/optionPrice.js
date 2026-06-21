// Human-readable price hints for Step-A option widgets. Mirrors how
// server/lib/dynamicPricing.js interprets each option, so the label the customer
// sees matches the amount the engine charges.

const rm = (n) => {
  const v = Math.abs(Number(n) || 0);
  return Number.isInteger(v) ? `RM${v}` : `RM${v.toFixed(2)}`;
};

/** Modifier label for a SINGLE/MULTI/TIER option, respecting perUnit/perSqft. */
export function optionModifierLabel(question, option) {
  const cfg = question.config || {};
  if (cfg.perSqft) {
    const v = Number(option.price_modifier_per_sqft) || 0;
    if (!v) return '';
    return `${v > 0 ? '+' : '−'}${rm(v)}/sqft`;
  }
  if (cfg.perUnit) {
    const v = Number(option.price_modifier) || 0;
    if (!v) return '';
    return `${v > 0 ? '+' : '−'}${rm(v)}/unit`;
  }
  const v = Number(option.price_modifier) || 0;
  if (!v) return '';
  return `${v > 0 ? '+' : '−'}${rm(v)}`;
}

/** Absolute price for a TIER_SELECT card (it sets the base, not a delta). */
export function tierPriceLabel(option) {
  return rm(option.price_modifier);
}

/** Per-unit price label for a TIER_QUANTITY row. */
export function unitPriceLabel(option) {
  return `${rm(option.unit_price)}/ea`;
}

export { rm };
