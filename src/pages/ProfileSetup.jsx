import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Globe, ArrowRight, Check } from 'lucide-react';
import { servisaku } from '@/api/servisakuClient';
import { Button } from '@/components/ui/button';
import { CITIES } from '@/lib/services';
import { toast } from 'sonner';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [_user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [language, setLanguage] = useState('en');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    servisaku.auth.me().then(u => {
      setUser(u);
      setName(u.full_name || '');
      if (u.city) setCity(u.city);
      if (u.language) setLanguage(u.language);
    });
  }, []);

  const handleSave = async () => {
    if (!name.trim() || !city) {
      toast.error('Please fill in all fields');
      return;
    }
    setSaving(true);
    await servisaku.auth.updateMe({ city, language });
    toast.success('Profile saved!');
    navigate('/');
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background px-6 py-14 max-w-sm mx-auto">
      <div className="mb-8">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
          <User className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-xl font-bold">Complete your profile</h1>
        <p className="text-sm text-muted-foreground mt-1">A few details to get you started</p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-xs font-semibold mb-2 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-primary" /> Full Name
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Ahmad Bin Abdullah"
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/20"
          />
        </div>

        <div>
          <label className="text-xs font-semibold mb-2 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" /> Your Area
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CITIES.map(c => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={`text-xs py-2.5 px-3 rounded-xl border text-left transition-all ${city === c ? 'border-primary bg-accent text-primary font-semibold' : 'border-border bg-card text-muted-foreground'}`}
              >
                {city === c && <Check className="h-3 w-3 inline mr-1" />}{c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold mb-2 flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-primary" /> Language
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[{ id: 'en', label: 'English' }, { id: 'ms', label: 'Bahasa Malaysia' }].map(l => (
              <button
                key={l.id}
                onClick={() => setLanguage(l.id)}
                className={`text-xs py-3 rounded-xl border transition-all ${language === l.id ? 'border-primary bg-accent text-primary font-semibold' : 'border-border bg-card text-muted-foreground'}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full h-12 rounded-xl mt-8">
        {saving ? 'Saving...' : 'Continue to FixMate'} <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}