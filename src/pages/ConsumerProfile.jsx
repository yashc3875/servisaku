import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Globe, Heart, Shield, LogOut, ChevronRight, Plus, Trash2, Star, Bell } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { CITIES } from '@/lib/services';
import { toast } from 'sonner';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function ConsumerProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('profile');
  const [addresses, setAddresses] = useState([]);
  const [city, setCity] = useState('');
  const [language, setLanguage] = useState('en');
  const [saving, setSaving] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: '', street: '', area: '', city: '', postcode: '' });

  useEffect(() => {
    const load = async () => {
      const me = await base44.auth.me();
      setUser(me);
      setCity(me.city || '');
      setLanguage(me.language || 'en');
      const addrs = await base44.entities.Address.filter({ user_email: me.email });
      setAddresses(addrs);
    };
    load();
  }, []);

  const { checkUserAuth } = useAuth(); // Needs import or destructured from existing

  const handleSaveProfile = async () => {
    setSaving(true);
    await base44.auth.updateMe({ city, language });
    await checkUserAuth();
    toast.success('Profile updated!');
    setSaving(false);
  };

  const handleAddAddress = async () => {
    if (!newAddr.street || !newAddr.city) return toast.error('Please fill address details');
    const me = await base44.auth.me();
    const created = await base44.entities.Address.create({ ...newAddr, user_email: me.email });
    setAddresses(a => [...a, created]);
    setNewAddr({ label: '', street: '', area: '', city: '', postcode: '' });
    setShowAddAddress(false);
    toast.success('Address added!');
  };

  const handleDeleteAddress = async (id) => {
    await base44.entities.Address.delete(id);
    setAddresses(a => a.filter(addr => addr.id !== id));
    toast.success('Address removed');
  };

  if (!user) return <div className="flex justify-center pt-32"><div className="w-6 h-6 border-2 border-raised border-t-brand rounded-full animate-spin" /></div>;

  return (
    <div className="px-5 pt-14 pb-4 max-w-lg mx-auto text-ink">
      {/* Avatar */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-brand/10 flex items-center justify-center mb-3 relative">
          <span className="text-2xl font-bold text-brand">{user.full_name?.charAt(0) || 'U'}</span>
        </div>
        <h2 className="text-lg font-bold">{user.full_name}</h2>
        <p className="text-xs text-ink-secondary">{user.email || user.phone || 'ServisAku User'}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[10px] font-semibold text-brand-ink bg-brand-tint px-2.5 py-0.5 rounded-full capitalize">{user.role}</span>
          {user.phone_verified && (
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">✓ Verified</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-raised rounded-xl p-1 mb-5">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${tab === t.id ? 'bg-surface text-ink shadow-sm' : 'text-ink-secondary'}`}>
            <t.icon className="h-3.5 w-3.5" />{t.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-brand" /> Full Name
            </label>
            <input value={user.full_name || ''} readOnly
              className="w-full bg-raised rounded-xl px-4 py-3 text-sm outline-none text-ink-secondary" />
            <p className="text-[10px] text-ink-secondary mt-1">Name is managed by your login provider</p>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1.5 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-brand" /> Your Area
            </label>
            <select value={city} onChange={e => setCity(e.target.value)}
              className="w-full bg-raised rounded-xl px-4 py-3 text-sm outline-none text-ink">
              <option value="">Select area</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold mb-2 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-brand" /> Language
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[{ id: 'en', label: '🇬🇧 English' }, { id: 'ms', label: '🇲🇾 Bahasa Malaysia' }].map(l => (
                <button key={l.id} onClick={() => setLanguage(l.id)}
                  className={`text-xs py-3 rounded-xl border transition-all ${language === l.id ? 'border-brand bg-brand-tint text-brand-ink font-semibold' : 'border-hairline/10 bg-surface text-ink-secondary'}`}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleSaveProfile} disabled={saving} className="w-full h-12 rounded-xl mt-2 bg-brand text-ink-inverse hover:bg-brand/90">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}

      {/* Addresses Tab */}
      {tab === 'addresses' && (
        <div>
          <div className="space-y-3 mb-4">
            {addresses.map(addr => (
              <div key={addr.id} className="bg-surface border border-hairline/10 rounded-2xl p-4 flex items-start justify-between hover:bg-raised/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm">{addr.label || 'Address'}</p>
                    {addr.is_default && <span className="text-[9px] bg-brand/10 text-brand px-2 py-0.5 rounded-full font-semibold">Default</span>}
                  </div>
                  <p className="text-xs text-ink-secondary">{addr.street}</p>
                  <p className="text-xs text-ink-secondary">{addr.area}, {addr.city} {addr.postcode}</p>
                </div>
                <button onClick={() => handleDeleteAddress(addr.id)} className="text-ink-secondary hover:text-danger transition-colors p-1">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            {addresses.length === 0 && (
              <div className="text-center py-8 text-ink-secondary">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No saved addresses</p>
              </div>
            )}
          </div>

          {showAddAddress ? (
            <div className="bg-surface border border-hairline/10 rounded-2xl p-4 space-y-3 hover:bg-raised/30 transition-colors">
              <h4 className="text-sm font-bold">New Address</h4>
              {[
                { key: 'label', placeholder: 'Label (e.g. Home, Office)' },
                { key: 'street', placeholder: 'Street & unit number *' },
                { key: 'area', placeholder: 'Area / neighbourhood' },
                { key: 'postcode', placeholder: 'Postcode' },
              ].map(f => (
                <input key={f.key} value={newAddr[f.key]} onChange={e => setNewAddr(a => ({ ...a, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full bg-raised rounded-xl px-4 py-3 text-sm outline-none text-ink placeholder:text-ink-tertiary" />
              ))}
              <select value={newAddr.city} onChange={e => setNewAddr(a => ({ ...a, city: e.target.value }))}
                className="w-full bg-raised rounded-xl px-4 py-3 text-sm outline-none text-ink">
                <option value="">Select city *</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex gap-2">
                <Button onClick={handleAddAddress} size="sm" className="flex-1 rounded-xl bg-brand text-ink-inverse hover:bg-brand/90">Save</Button>
                <Button onClick={() => setShowAddAddress(false)} variant="outline" size="sm" className="flex-1 rounded-xl border-hairline/10 text-ink">Cancel</Button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddAddress(true)}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-dashed border-hairline/10 text-sm text-ink-secondary hover:border-brand hover:text-brand transition-colors">
              <Plus className="h-4 w-4" /> Add New Address
            </button>
          )}
        </div>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <div className="space-y-3">
          {[
            { icon: Bell, label: 'Notification Preferences', desc: 'Manage push, SMS, email alerts', action: () => {} },
            { icon: Shield, label: 'Two-Factor Auth', desc: 'OTP via SMS is enabled', action: () => {} },
            { icon: Star, label: 'Biometric Login', desc: 'Enable Face ID / fingerprint', action: () => toast.info('Coming soon') },
            { icon: Heart, label: 'Favourite Partners', desc: 'Manage your saved partners', action: () => navigate('/bookings') },
          ].map((item, i) => (
            <button key={i} onClick={item.action}
              className="w-full flex items-center gap-3 bg-surface border border-hairline/10 rounded-2xl p-4 hover:bg-raised/30 transition-colors text-left">
              <div className="w-9 h-9 rounded-xl bg-raised flex items-center justify-center shrink-0">
                <item.icon className="h-4 w-4 text-ink-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-ink-secondary">{item.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-ink-secondary" />
            </button>
          ))}

          <div className="pt-2">
            <button onClick={() => base44.auth.logout()}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-danger/30 text-danger text-sm font-medium hover:bg-danger/5 transition-colors">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}