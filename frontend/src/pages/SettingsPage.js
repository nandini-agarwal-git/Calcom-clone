import React, { useState, useEffect } from 'react';
import { User, Globe, Save, Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { getUser, updateUser } from '../utils/api';
import { Input, Textarea, Select } from '../components/ui/Input';
import Button from '../components/ui/Button';
import { timezones } from '../utils/helpers';

export default function SettingsPage() {
  const [form, setForm] = useState({ name: '', bio: '', timezone: 'UTC', avatar_url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const BASE = process.env.REACT_APP_BASE_URL || window.location.origin;

  useEffect(() => {
    getUser().then(u => setForm({ name: u.name||'', bio: u.bio||'', timezone: u.timezone||'UTC', avatar_url: u.avatar_url||'' }))
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const save = async e => {
    e.preventDefault(); setSaving(true);
    try { await updateUser(form); toast.success('Settings saved'); }
    catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  if (loading) return null;

  return (
    <div style={{ animation: 'fadeIn 200ms ease-out' }}>
      <div style={{ marginBottom: 26 }}>
        <h1 style={{ fontSize: 21, fontWeight: 700, color: '#f0f0f0', letterSpacing: '-0.4px', marginBottom: 4 }}>Settings</h1>
        <p style={{ fontSize: 13, color: '#a0a0a0' }}>Manage your account and profile information.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 250px', gap: 18, alignItems: 'start' }}>
        <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Profile */}
          <div style={{ backgroundColor: '#111', border: '1px solid #1f1f1f', borderRadius: 10, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #1a1a1a' }}>
              <User size={15} color="#606060" />
              <h2 style={{ fontSize: 14, fontWeight: 600, color: '#c0c0c0' }}>Profile</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: 13, backgroundColor: '#1a1a1a', borderRadius: 9, marginBottom: 16, border: '1px solid #1f1f1f' }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: '#2a2a2a', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 700, color: '#808080', flexShrink: 0 }}>
                {form.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#d0d0d0' }}>{form.name || 'Your name'}</div>
                <div style={{ fontSize: 12, color: '#808080', marginTop: 2 }}>cal.clone/alex</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <Input label="Display name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Alex Johnson" />
              <Input label="Avatar URL" value={form.avatar_url} onChange={e => set('avatar_url', e.target.value)} placeholder="https://..." hint="Direct link to an image" />
              <Textarea label="Bio" value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell people a bit about yourself..." rows={3} />
            </div>
          </div>

          {/* Regional */}
          <div style={{ backgroundColor: '#111', border: '1px solid #1f1f1f', borderRadius: 10, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16, paddingBottom: 14, borderBottom: '1px solid #1a1a1a' }}>
              <Globe size={15} color="#606060" />
              <h2 style={{ fontSize: 14, fontWeight: 600, color: '#c0c0c0' }}>Regional</h2>
            </div>
            <Select label="Timezone" value={form.timezone} onChange={e => set('timezone', e.target.value)}>
              {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </Select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" loading={saving} size="sm"><Save size={13} /> Save settings</Button>
          </div>
        </form>

        {/* Side cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div style={{ backgroundColor: '#111', border: '1px solid #1f1f1f', borderRadius: 10, padding: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#a0a0a0', marginBottom: 5 }}>Your booking link</h3>
            <p style={{ fontSize: 12, color: '#909090', marginBottom: 12 }}>Share this link to let people book with you.</p>
            <div style={{ padding: '8px 11px', backgroundColor: '#1a1a1a', border: '1px solid #252525', borderRadius: 7, fontSize: 11, color: '#606060', fontFamily: 'monospace', wordBreak: 'break-all', marginBottom: 11 }}>{BASE}/book/alex</div>
            <div style={{ display: 'flex', gap: 7 }}>
              {[
                { icon: Copy,         label: 'Copy',    onClick: () => { navigator.clipboard.writeText(`${BASE}/book/alex`); toast.success('Copied!'); } },
                { icon: ExternalLink, label: 'Preview', onClick: () => window.open(`${BASE}/book/alex`, '_blank') },
              ].map(({ icon: Icon, label, onClick }) => (
                <button key={label} onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 11px', borderRadius: 6, border: '1px solid #252525', backgroundColor: 'transparent', color: '#808080', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <Icon size={12} />{label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ backgroundColor: '#111', border: '1px solid #1f1f1f', borderRadius: 10, padding: 18 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#a0a0a0', marginBottom: 13 }}>Account</h3>
            {[['Plan','Free'],['Member since','2025'],['Bookings this month','—']].map(([k,v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 9 }}>
                <span style={{ color: '#909090' }}>{k}</span>
                <span style={{ color: '#808080', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
            <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%', marginTop: 14, padding: '8px', borderRadius: 7, border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#808080', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}