import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, TrendingUp, Clock, CheckCircle2, Download, Calendar, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { formatRM, calcPartnerPayout } from '@/lib/paymentEngine';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import moment from 'moment';

const STATUS_COLOR = {
  paid: 'bg-emerald-50 text-emerald-700',
  scheduled: 'bg-blue-50 text-blue-700',
  pending: 'bg-amber-50 text-amber-700',
  processing: 'bg-violet-50 text-violet-700',
  failed: 'bg-red-50 text-red-600',
};

export default function PartnerEarnings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(moment().format('YYYY-MM'));
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const [p, b] = await Promise.all([
        base44.entities.PayoutRecord.filter({ partner_email: me.email }, '-created_date', 100),
        base44.entities.Booking.filter({ partner_email: me.email, status: 'completed' }, '-created_date', 100),
      ]);
      setPayouts(p);
      setBookings(b);
      setLoading(false);
    };
    load();
  }, []);

  const filteredPayouts = payouts.filter(p => !period || p.period_month === period);
  const periodBookings = bookings.filter(b => b.date?.startsWith(period));

  const totalEarned = payouts.filter(p => p.status === 'paid').reduce((s, p) => s + (p.net_payout || 0), 0);
  const pendingAmount = payouts.filter(p => ['pending', 'scheduled'].includes(p.status)).reduce((s, p) => s + (p.net_payout || 0), 0);
  const totalGross = bookings.reduce((s, b) => s + (b.price || 0), 0);
  const totalCommission = totalGross * 0.2;

  // Build last 6 months chart data
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const m = moment().subtract(5 - i, 'months');
    const key = m.format('YYYY-MM');
    const earned = payouts.filter(p => p.period_month === key && p.status === 'paid')
      .reduce((s, p) => s + (p.net_payout || 0), 0);
    return { month: m.format('MMM'), earned };
  });

  const months = [];
  for (let i = 5; i >= 0; i--) months.push(moment().subtract(i, 'months').format('YYYY-MM'));

  return (
    <div className="min-h-screen bg-background font-inter pb-8">
      <div className="bg-primary px-5 pt-14 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <ArrowLeft className="h-4 w-4 text-white" />
          </button>
          <div>
            <p className="text-white/60 text-xs">My Earnings</p>
            <h1 className="text-xl font-bold text-white">{user?.full_name?.split(' ')[0]}</h1>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Total Earned', value: formatRM(totalEarned), sub: 'All time' },
            { label: 'Pending', value: formatRM(pendingAmount), sub: 'Awaiting payout' },
            { label: 'This Month', value: formatRM(periodBookings.reduce((s,b)=>s+(b.price||0)*0.8,0)), sub: moment(period).format('MMM YYYY') },
          ].map((s, i) => (
            <div key={i} className="bg-white/10 rounded-2xl p-3 text-center">
              <p className="text-white font-bold text-base">{s.value}</p>
              <p className="text-white/50 text-[10px]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 max-w-2xl mx-auto pt-5 space-y-5">

        {/* Chart */}
        <div className="bg-white rounded-3xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold">Earnings Trend</p>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={chartData} barCategoryGap="30%">
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => [formatRM(v), 'Earnings']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
              <Bar dataKey="earned" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === chartData.length - 1 ? 'hsl(151,58%,20%)' : '#e5e7eb'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Commission Breakdown */}
        <div className="bg-white rounded-3xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4">
          <p className="text-sm font-bold mb-3">Commission Breakdown</p>
          <div className="space-y-2 text-xs">
            {[
              { label: 'Gross Earnings (from consumers)', value: formatRM(totalGross), color: 'text-foreground' },
              { label: 'Platform Commission (20%)', value: `-${formatRM(totalCommission)}`, color: 'text-red-500' },
              { label: 'Net Earnings', value: formatRM(totalGross - totalCommission), color: 'text-primary font-bold' },
            ].map((row, i) => (
              <div key={i} className={`flex justify-between ${i === 2 ? 'border-t border-border pt-2' : ''}`}>
                <span className="text-muted-foreground">{row.label}</span>
                <span className={row.color}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {['overview', 'payouts', 'history'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all capitalize ${tab === t ? 'bg-primary text-white' : 'bg-white border border-border text-muted-foreground'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Period Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
          <select value={period} onChange={e => setPeriod(e.target.value)}
            className="flex-1 bg-white border border-border rounded-xl px-3 py-2.5 text-sm outline-none">
            {months.map(m => (
              <option key={m} value={m}>{moment(m).format('MMMM YYYY')}</option>
            ))}
          </select>
          <button onClick={() => toast?.success?.('PDF export coming soon')}
            className="h-10 px-3 bg-white border border-border rounded-xl flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" /></div>
        ) : tab === 'overview' ? (
          <div className="space-y-3">
            {periodBookings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-border">
                <p className="text-sm text-muted-foreground">No completed jobs this period</p>
              </div>
            ) : periodBookings.map(b => {
              const payout = calcPartnerPayout(b.price || 0);
              return (
                <div key={b.id} className="bg-white rounded-2xl border border-border p-4 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <div>
                    <p className="font-semibold text-sm">{b.service_type}</p>
                    <p className="text-xs text-muted-foreground">{moment(b.date).format('D MMM YYYY')} • {b.package_name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Gross: {formatRM(b.price)} — Commission: {formatRM(payout.commission)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatRM(payout.net)}</p>
                    <p className="text-[10px] text-muted-foreground">Net payout</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : tab === 'payouts' ? (
          <div className="space-y-3">
            {filteredPayouts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-3xl border border-border">
                <p className="text-sm text-muted-foreground">No payout records for this period</p>
              </div>
            ) : filteredPayouts.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-border p-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm">{formatRM(p.net_payout)}</p>
                    <p className="text-xs text-muted-foreground">via {p.payout_method?.toUpperCase() || 'DuitNow'}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[p.status] || 'bg-muted text-muted-foreground'}`}>
                    {p.status}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Gross: {formatRM(p.gross_earning)}</span>
                  <span>Commission: -{formatRM(p.commission_amount)}</span>
                  {p.scheduled_date && <span>Due: {moment(p.scheduled_date).format('D MMM')}</span>}
                </div>
                {p.reference_no && (
                  <p className="text-[10px] font-mono text-muted-foreground mt-1">{p.reference_no}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 20).map(b => (
              <div key={b.id} className="flex items-center gap-3 bg-white rounded-2xl border border-border p-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{b.service_type}</p>
                  <p className="text-xs text-muted-foreground">{moment(b.date).format('D MMM YYYY')}</p>
                </div>
                <p className="font-bold text-primary text-sm">{formatRM((b.price || 0) * 0.8)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}