// Turns a dynamic booking's stored `answers` ({ [questionId]: value }) into
// human-readable { label, value } rows, using the service's question config.
// Mirrors the widget value shapes in src/components/booking/widgets/*.
//
// This is what lets a partner see EVERY answer the customer gave, so they never
// have to ask the same questions again.

const FEE_TYPES = new Set(['BASE', 'VISIT_FEE', 'SURCHARGE', 'PLATFORM_FEE', 'FEE']);

export function summarizeAnswers(questions = [], answers = {}) {
  if (!Array.isArray(questions) || !answers) return [];
  const rows = [];

  for (const q of questions) {
    const a = answers[q.id];
    if (a === undefined || a === null || a === '') continue;

    const optLabel = (id) => (q.options || []).find((o) => o.id === id)?.label ?? id;
    let value;

    switch (q.type) {
      case 'TIER_SELECT':
      case 'SINGLE_SELECT':
        value = optLabel(a);
        break;
      case 'MULTI_SELECT':
        if (!Array.isArray(a) || a.length === 0) continue;
        value = a.map(optLabel).join(', ');
        break;
      case 'TIER_QUANTITY': {
        const parts = Object.entries(a)
          .filter(([, qty]) => Number(qty) > 0)
          .map(([id, qty]) => `${optLabel(id)} × ${qty}`);
        if (!parts.length) continue;
        value = parts.join(', ');
        break;
      }
      case 'QUANTITY': {
        const n = Number(a);
        if (!n) continue;
        value = `${n}${q.config?.unit ? ` ${q.config.unit}` : ''}`;
        break;
      }
      case 'AREA_INPUT': {
        const n = Number(a);
        if (!n) continue;
        value = `${n} ${q.config?.unit || 'sqft'}`;
        break;
      }
      case 'HOURS_INPUT': {
        const n = Number(a);
        if (!n) continue;
        value = `${n} hour${n === 1 ? '' : 's'}`;
        break;
      }
      case 'INFO':
        value = String(a);
        break;
      default:
        value = typeof a === 'object' ? JSON.stringify(a) : String(a);
    }

    rows.push({ id: q.id, label: q.label, value, type: q.type });
  }

  return rows;
}

// Fallback when the service's question config can't be loaded (e.g. a legacy
// booking): derive a best-effort answer list from the priced line items.
export function answersFromBreakdown(breakdown = []) {
  if (!Array.isArray(breakdown)) return [];
  return breakdown
    .filter((l) => l.questionId && !FEE_TYPES.has(l.type))
    .map((l) => ({
      id: l.questionId,
      label: l.label,
      value:
        l.optionLabel ||
        (l.qty != null ? `× ${l.qty}` :
          l.area != null ? `${l.area} sqft` :
            l.hours != null ? `${l.hours} hours` : '—'),
      type: l.type,
    }));
}
