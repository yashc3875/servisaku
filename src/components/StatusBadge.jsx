import { cn } from '@/lib/utils';

const STATUS_MAP = {
  pending: { label: 'Pending', class: 'bg-amber-50 text-amber-700 border-amber-100' },
  assigned: { label: 'Assigned', class: 'bg-blue-50 text-blue-700 border-blue-100' },
  confirmed: { label: 'Confirmed', class: 'bg-blue-50 text-blue-700 border-blue-100' },
  accepted: { label: 'Accepted', class: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  en_route: { label: 'En Route', class: 'bg-violet-50 text-violet-700 border-violet-100' },
  arrived: { label: 'Arrived', class: 'bg-primary/10 text-primary border-primary/20' },
  in_progress: { label: 'In Progress', class: 'bg-primary/10 text-primary border-primary/20' },
  started: { label: 'Started', class: 'bg-primary/10 text-primary border-primary/20' },
  completed: { label: 'Completed', class: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  cancelled: { label: 'Cancelled', class: 'bg-red-50 text-red-600 border-red-100' },
  disputed: { label: 'Disputed', class: 'bg-orange-50 text-orange-700 border-orange-100' },
};

export default function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  return (
    <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full border", s.class)}>
      {s.label}
    </span>
  );
}