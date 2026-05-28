import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Tag, CheckCircle2, X, Loader2 } from 'lucide-react';

export default function CouponInput({ serviceType, subtotal, onApply }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(null);
  const [error, setError] = useState('');

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    const coupons = await base44.entities.Coupon.filter({ code: code.toUpperCase(), is_active: true });
    const coupon = coupons[0];

    if (!coupon) {
      setError('Invalid or expired coupon code');
      setLoading(false);
      return;
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
      setError('This coupon has expired');
      setLoading(false);
      return;
    }
    if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
      setError(`Minimum order RM${coupon.min_order_amount} required`);
      setLoading(false);
      return;
    }
    if (coupon.applicable_services?.length > 0 && !coupon.applicable_services.includes(serviceType)) {
      setError('This coupon is not valid for this service');
      setLoading(false);
      return;
    }

    const discount = coupon.discount_type === 'percentage'
      ? Math.min(Math.round(subtotal * coupon.discount_value / 100), coupon.max_discount_cap || 9999)
      : coupon.discount_value;

    setApplied({ ...coupon, calculatedDiscount: discount });
    onApply({ ...coupon, calculatedDiscount: discount });
    setLoading(false);
  };

  const handleRemove = () => {
    setApplied(null);
    setCode('');
    onApply(null);
  };

  if (applied) {
    return (
      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-3">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-bold text-emerald-700">{applied.code} applied!</p>
          <p className="text-xs text-emerald-600">
            {applied.discount_type === 'percentage' ? `${applied.discount_value}% off` : `RM${applied.discount_value} off`}
            {' '}— saving RM{applied.calculatedDiscount}
          </p>
        </div>
        <button onClick={handleRemove} className="text-emerald-500 hover:text-emerald-700">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Enter promo code"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-3 text-sm font-mono outline-none focus:ring-2 ring-primary/20"
          />
        </div>
        <button
          onClick={handleApply}
          disabled={!code || loading}
          className="px-4 py-3 bg-primary text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center gap-1.5"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 pl-1">{error}</p>}
    </div>
  );
}