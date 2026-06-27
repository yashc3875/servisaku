// Renders the customer's booking-questionnaire answers as clean label/value rows.
// `rows` come from summarizeAnswers() / answersFromBreakdown().
export function AnswerList({ rows = [], emptyText = 'No additional details provided.' }) {
  if (!rows.length) {
    return <p className="text-xs text-ink-tertiary">{emptyText}</p>;
  }

  return (
    <dl className="divide-y divide-hairline/10">
      {rows.map((r) => (
        <div key={r.id} className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
          <dt className="text-xs font-medium text-ink-secondary">{r.label}</dt>
          <dd className="max-w-[60%] text-right text-xs font-semibold text-ink">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
