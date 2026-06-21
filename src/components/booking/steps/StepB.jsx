import { Field, Segmented } from '../fields';

// Step B — Property & Access. Universal across all services.
export default function StepB({ property, setProperty }) {
  const set = (k) => (v) => setProperty((p) => ({ ...p, [k]: v }));
  return (
    <div className="flex flex-col gap-6">
      <Field label="Property type" required>
        <Segmented
          options={[{ value: 'residential', label: 'Residential' }, { value: 'commercial', label: 'Commercial' }]}
          value={property.propertyType}
          onChange={set('propertyType')}
        />
      </Field>
      <Field label="Building type" required>
        <Segmented
          options={[
            { value: 'apartment', label: 'Apartment' },
            { value: 'condo', label: 'Condo' },
            { value: 'landed', label: 'Landed House' },
          ]}
          value={property.buildingType}
          onChange={set('buildingType')}
        />
      </Field>
      <Field label="Floor number" hint="Ground floor = 0">
        <input
          type="number"
          min={0}
          value={property.floor ?? ''}
          onChange={(e) => set('floor')(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-32 rounded-xl border border-hairline bg-surface px-4 py-3 text-ink outline-none focus:ring-1 focus:ring-brand"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Lift available?">
          <Segmented options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} value={property.lift} onChange={set('lift')} />
        </Field>
        <Field label="Parking available?">
          <Segmented options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]} value={property.parking} onChange={set('parking')} />
        </Field>
      </div>
    </div>
  );
}
