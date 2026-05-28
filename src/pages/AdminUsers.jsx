import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, ShieldCheck, ShieldX, Search, Filter, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import moment from 'moment';

const TABS = [
  { id: 'pending', label: 'Pending Approval' },
  { id: 'partners', label: 'All Partners' },
  { id: 'consumers', label: 'Consumers' },
  { id: 'admins', label: 'Admins' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [query, setQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    base44.entities.User.list('-created_date', 100).then(u => {
      setUsers(u);
      setLoading(false);
    });
  }, []);

  const filteredUsers = users.filter(u => {
    const matchesQuery = !query || u.full_name?.toLowerCase().includes(query.toLowerCase()) || u.email?.toLowerCase().includes(query.toLowerCase());
    if (!matchesQuery) return false;
    if (tab === 'pending') return u.role === 'partner' && !u.partner_verified;
    if (tab === 'partners') return u.role === 'partner';
    if (tab === 'consumers') return u.role === 'consumer';
    if (tab === 'admins') return u.role === 'admin' || u.role === 'super_admin';
    return true;
  });

  const handleApprove = async (userId) => {
    setActionLoading(userId);
    await base44.entities.User.update(userId, { partner_verified: true });
    setUsers(u => u.map(user => user.id === userId ? { ...user, partner_verified: true } : user));
    toast.success('Partner approved!');
    setActionLoading(null);
  };

  const handleReject = async (userId) => {
    setActionLoading(userId);
    await base44.entities.User.update(userId, { is_active: false });
    setUsers(u => u.map(user => user.id === userId ? { ...user, is_active: false } : user));
    toast.success('Partner application rejected');
    setActionLoading(null);
  };

  const handleChangeRole = async (userId, newRole) => {
    await base44.entities.User.update(userId, { role: newRole });
    setUsers(u => u.map(user => user.id === userId ? { ...user, role: newRole } : user));
    toast.success('Role updated');
  };

  const counts = {
    pending: users.filter(u => u.role === 'partner' && !u.partner_verified).length,
    partners: users.filter(u => u.role === 'partner').length,
    consumers: users.filter(u => u.role === 'consumer').length,
    admins: users.filter(u => ['admin', 'super_admin'].includes(u.role)).length,
  };

  return (
    <div className="px-5 pt-14 pb-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-5">
        <Users className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold">User Management</h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {TABS.map(t => (
          <div key={t.id} className="bg-card border border-border rounded-xl p-3 text-center">
            <p className="text-lg font-bold">{counts[t.id]}</p>
            <p className="text-[9px] text-muted-foreground leading-tight">{t.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-muted rounded-xl pl-10 pr-4 py-3 text-sm outline-none" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${tab === t.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {t.label} ({counts[t.id]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-muted border-t-primary rounded-full animate-spin" /></div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No users found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map(user => (
            <div key={user.id} className="bg-card border border-border rounded-2xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-primary">{user.full_name?.charAt(0) || '?'}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{user.full_name || 'Unknown User'}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    user.role === 'super_admin' ? 'bg-violet-100 text-violet-700' :
                    user.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                    user.role === 'partner' ? 'bg-amber-100 text-amber-700' :
                    'bg-muted text-muted-foreground'
                  }`}>{user.role}</span>
                  {user.role === 'partner' && (
                    user.partner_verified
                      ? <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">✓ Verified</span>
                      : <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Pending</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>Joined {moment(user.created_date).fromNow()}</span>
                {user.phone && <span>📱 {user.phone}</span>}
                {user.city && <span>📍 {user.city}</span>}
              </div>

              {user.role === 'partner' && user.partner_services?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {user.partner_services.map((s, i) => (
                    <span key={i} className="text-[9px] bg-muted px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {tab === 'pending' && !user.partner_verified && (
                  <>
                    <Button onClick={() => handleApprove(user.id)} size="sm"
                      disabled={actionLoading === user.id}
                      className="rounded-lg text-xs h-8 flex-1 bg-emerald-600 hover:bg-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                    </Button>
                    <Button onClick={() => handleReject(user.id)} size="sm" variant="outline"
                      disabled={actionLoading === user.id}
                      className="rounded-lg text-xs h-8 flex-1 border-destructive text-destructive hover:bg-destructive/5">
                      <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                    </Button>
                  </>
                )}
                {tab !== 'pending' && tab !== 'admins' && (
                  <select value={user.role} onChange={e => handleChangeRole(user.id, e.target.value)}
                    className="text-xs bg-muted rounded-lg px-2 py-1.5 outline-none border-0">
                    {['consumer', 'partner', 'admin'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                )}
                <span className={`ml-auto flex items-center gap-1 text-[10px] ${user.is_active !== false ? 'text-emerald-600' : 'text-red-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${user.is_active !== false ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  {user.is_active !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}