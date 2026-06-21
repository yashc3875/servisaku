// QuestionRenderer — the heart of the dynamic Step A. Switches UI purely on
// question.type, so a new service is JSON only: no new frontend code.
import TierSelect from './widgets/TierSelect';
import SingleSelect from './widgets/SingleSelect';
import MultiSelect from './widgets/MultiSelect';
import QuantitySelector from './widgets/QuantitySelector';
import TierQuantitySelector from './widgets/TierQuantitySelector';
import AreaInput from './widgets/AreaInput';
import HoursInput from './widgets/HoursInput';

const WIDGETS = {
  TIER_SELECT: TierSelect,
  SINGLE_SELECT: SingleSelect,
  MULTI_SELECT: MultiSelect,
  QUANTITY: QuantitySelector,
  TIER_QUANTITY: TierQuantitySelector,
  AREA_INPUT: AreaInput,
  HOURS_INPUT: HoursInput,
};

export default function QuestionRenderer({ question, value, onChange }) {
  // INFO — non-priced context for the technician (reference photo notes, last
  // service date, injury area…). Captured into answers but ignored by pricing.
  if (question.type === 'INFO') {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-ink-secondary">{question.label}</label>
        <textarea
          rows={2}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Optional — helps the technician prepare"
          className="rounded-xl border border-hairline bg-surface px-4 py-3 text-ink outline-none focus:ring-1 focus:ring-brand"
        />
      </div>
    );
  }

  const Widget = WIDGETS[question.type];
  if (!Widget) return null;

  return (
    <div className="flex flex-col gap-3">
      <label className="font-semibold text-ink">
        {question.label}
        {question.required && <span className="ml-1 text-danger">*</span>}
      </label>
      <Widget question={question} value={value} onChange={onChange} />
    </div>
  );
}
