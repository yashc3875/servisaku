import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  TrendingUp, Clock, CheckCircle2, DollarSign, MapPin,
  ToggleLeft, ToggleRight, Star, Calendar, ChevronRight,
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import moment from 'moment';

export default function PartnerDashboard() {
  const [user, setUser]       = useState(null);
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline]   = useState(true);
  const [tab, setTab]         = useState('today');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);
      const myJobs = await base44.entities.Booking.filter({ partner_email: me.email }, '-created_date', 50);
      setJobs(myJobs);
      setLoading(false);
    };
    load();
  }, []);

  const today         = moment().format('YYYY-MM-DD');
  const todayJobs     = jobs.filter(j => j.date === today);
  const upcomingJobs  = jobs.filter(j => j.date > today && !['cancelled','completed'].includes(j.status));
  const completedJobs = jobs.filter(j => j.status === 'completed');
  const weekRevenue   = completedJobs
    .filter(j => moment(j.date).isAfter(moment().subtract(7, 'days')))
    .reduce((s, j) => s + (j.partner_payout || (j.price || 0) * 0.8), 0);

  const displayJobs = tab === 'today' ? todayJobs : tab === 'upcoming' ? upcomingJobs : completedJobs.slice(0, 10);

  const updateStatus = async (id, status) => {
    await base44.entities.Booking.update(id, { status });
    setJobs(jobs.map(j => j.id === id ? { ...j, status } : j));
    toast.success(`Job ${status.replace('_', ' ')}`);
  };

  const STATS = [
    { label: 'Today',     value: todayJobs.length },
    { label: 'Upcoming',  value: upcomingJobs.length },
    { label: 'Completed', value: completedJobs.length },
  ];

  const TABS = [
    { id: 'today',     label: `Today`,    count: todayJobs.length    },
    { id: 'upcoming',  label: `Upcoming`, count: upcomingJobs.length },
    { id: 'completed', label: 'History',  count: null               },
  ];

  if (!user) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="font-inter min-h-screen bg-background" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}>

      {/* Header */}
      <div className="bg-gradient-to-br from-[#0a3d28] via-[#0f4c35] to-[#1a6644] px-5 lg:px-8 pt-14 lg:pt-8 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/50 text-xs font-medium tracking-wide">Partner Dashboard</p>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">
              {user.full_name?.split(' ')[0]}
            </h1>
          </div>
          <button
            onClick={() => { setOnline(!online); toast.success(online ? 'You are now offline' : 'You are now online!'); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              online ? 'bg-white text-primary shadow-md' : 'bg-white/15 text-white/60'
            }`}>
            {online ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            {online ? 'Online' : 'Offline'}
          </button>
        </div>

        {/* Earnings card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
          <p className="text-white/50 text-xs font-medium mb-1.5">This Week's Earnings</p>
          <p className="text-3xl font-bold text-white tracking-tight">RM {weekRevenue.toFixed(0)}</p>
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/10">
            {STATS.map((s, i) => (
              <div key={i}>
                <p className="text-white font-bold text-xl">{s.value}</p>
                <p className="text-white/45 text-[10px] font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 lg:px-8 -mt-4 space-y-4">

        {/* Offline warning */}
        {!online && (
          <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-4 flex items-center gap-3">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shrink-0" />
            <p className="text-sm text-amber-700 font-medium">You're offline — no new jobs will be assigned</p>
          </div>
        )}

        {/* Rating + Earnings row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-2xl border border-border/60 shadow-xs p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <p className="font-bold text-xl">{user.partner_rating?.toFixed(1) || '—'}</p>
              <p className="text-[10px] text-muted-foreground">Avg rating</p>
            </div>
          </div>
          <Link to="/partner/earnings"
            className="bg-white rounded-2xl border border-border/60 shadow-xs p-4 flex items-center gap-3 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0"
              style={{ background: 'hsl(var(--primary)/0.08)' }}>
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-primary">Earnings</p>
              <p className="text-[10px] text-muted-foreground">View payouts</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-primary" />
          </Link>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1.5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                tab === t.id ? 'bg-primary text-white shadow-sm' : 'bg-white border border-border/60 text-muted-foreground hover:text-foreground'
              }`}>
              {t.label}
              {t.count !== null && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${tab === t.id ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Jobs */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border/60 p-5 animate-pulse space-y-3">
                <div className="flex justify-between">
                  <div className="space-y-1.5">
                    <div className="h-4 w-28 bg-muted rounded-full" />
                    <div className="h-3 w-20 bg-muted rounded-full" />
                  </div>
                  <div className="h-6 w-16 bg-muted rounded-full" />
                </div>
                <div className="h-3 w-full bg-muted rounded-full" />
                <div className="h-3 w-1/2 bg-muted rounded-full" />
              </div>
            ))}
          </div>
        ) : displayJobs.length === 0 ? (
          <div className="flex flex-col items-center text-center py-14 bg-white rounded-2xl border border-border/60 shadow-xs">
            <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-bold text-sm">No {tab} jobs</p>
            <p className="text-xs text-muted-foreground mt-1">
              {tab === 'today' ? 'No jobs scheduled today' : 'Check back later'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayJobs.map(job => (
              <div key={job.id} className="bg-white rounded-2xl border border-border/60 shadow-xs p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-sm">{job.service_type}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{job.consumer_name}</p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {moment(job.date).format('D MMM')} · {job.time_slot}
                  </span>
                  <span className="flex items-center gap-1.5 truncate">
                    <MapPin className="h-3 w-3 shrink-0" />{job.city}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border/40">
                  <span className="font-bold text-primary text-base">
                    RM {job.partner_payout || Math.round((job.price || 0) * 0.8)}
                  </span>
                  <div className="flex gap-2">
                    {job.status === 'pending' && (
                      <Button size="sm" onClick={() => { updateStatus(job.id, 'accepted'); navigate(`/partner/job/${job.id}`); }}
                        className="rounded-xl text-xs h-9 px-4">Accept</Button>
                    )}
                    {job.status === 'accepted' && (
                      <Button size="sm" onClick={() => updateStatus(job.id, 'en_route')}
                        className="rounded-xl text-xs h-9 px-4">Start Travel</Button>
                    )}
                    {job.status === 'en_route' && (
                      <Button size="sm" onClick={() => updateStatus(job.id, 'arrived')}
                        className="rounded-xl text-xs h-9 px-4">Arrived</Button>
                    )}
                    {job.status === 'arrived' && (
                      <Button size="sm" onClick={() => updateStatus(job.id, 'started')}
                        className="rounded-xl text-xs h-9 px-4">Start Job</Button>
                    )}
                    {job.status === 'started' && (
                      <Button size="sm" onClick={() => updateStatus(job.id, 'completed')}
                        className="rounded-xl text-xs h-9 px-4 bg-emerald-600 hover:bg-emerald-700">Complete</Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}