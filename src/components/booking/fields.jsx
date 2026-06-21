import { cn } from '@/lib/utils';

// Small shared form primitives for the universal steps (B–F).

export function Field({ label, required, hint, children }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium text-ink">
          {label}
          {required && <span className="ml-1 text-danger">*</span>}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-ink-secondary">{hint}</p>}
    </div>
  );
}

// Segmented choice — a row of pill buttons for small option sets (yes/no, types).
export function Segmented({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const opt = typeof o === 'string' ? { value: o, label: o } : o;
        const on = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={on}
            className={cn(
              'rounded-full border px-4 py-2 text-sm font-medium transition',
              on ? 'border-brand bg-brand-tint text-brand ring-1 ring-brand' : 'border-hairline bg-surface text-ink hover:bg-raised',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function TextField({ value, onChange, ...props }) {
  return (
    <input
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-hairline bg-surface px-4 py-3 text-ink outline-none focus:ring-1 focus:ring-brand"
      {...props}
    />
  );
}
