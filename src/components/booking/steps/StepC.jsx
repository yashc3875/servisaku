import { cn } from '@/lib/utils';
import { Field } from '../fields';
import { SLOT_GROUPS } from '@/lib/bookingEngine';
import { isAfterHours, isUrgent } from '../scheduleRules';

// Step C — Date & Time. Supports same-day booking; flags after-hours / urgent
// surcharges so the live quote (and Step F) reflect them before payment.
export default function StepC({ schedule, setSchedule }) {
  const today = new Date();
  const minDate = today.toISOString().slice(0, 10);
  const set = (k) => (v) => setSchedule((s) => ({ ...s, [k]: v }));

  const afterHours = isAfterHours(schedule.timeSlot);
  const urgent = isUrgent(schedule.date);

  return (
    <div className="flex flex-col gap-6">
      <Field label="Date" required>
        <input
          type="date"
          min={minDate}
          value={schedule.date || ''}
          onChange={(e) => set('date')(e.target.value)}
          className="w-full rounded-xl border border-hairline bg-surface px-4 py-3 text-ink outline-none focus:ring-1 focus:ring-brand sm:w-64"
        />
      </Field>

      <Field label="Time slot" required>
        <div className="flex flex-col gap-4">
          {Object.entries(SLOT_GROUPS).map(([group, g]) => (
            <div key={group}>
              <div className="mb-2 text-sm font-medium text-ink-secondary">
                {g.emoji} {g.label} <span className="text-ink-tertiary">· {g.sub}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {g.slots.map((slot) => {
                  const on = schedule.timeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => set('timeSlot')(slot)}
                      aria-pressed={on}
                      className={cn(
                        'rounded-xl border px-3 py-2 text-sm font-medium transition',
                        on ? 'border-brand bg-brand-tint text-brand ring-1 ring-brand' : 'border-hairline bg-surface text-ink hover:bg-raised',
                      )}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Field>

      {(afterHours || urgent) && (
        <div className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-ink">
          {urgent && <div>⚡ Same-day booking — an urgent surcharge applies.</div>}
          {afterHours && <div>🌙 After-hours slot — an after-hours surcharge applies.</div>}
        </div>
      )}
    </div>
  );
}
