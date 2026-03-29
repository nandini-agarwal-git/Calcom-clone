import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSchedules, updateSchedule, addDateOverride, deleteDateOverride } from '../utils/api';
import { Select } from '../components/ui/Input';
import Button from '../components/ui/Button';
import { DAY_NAMES, timezones } from '../utils/helpers';

const TIMES = [];
for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m += 30) {
  const hh = h.toString().padStart(2,'0'), mm = m.toString().padStart(2,'0');
  const ap = h < 12 ? 'AM' : 'PM', dh = h % 12 || 12;
  TIMES.push({ value: `${hh}:${mm}`, label: `${dh}:${mm} ${ap}` });
}

function Toggle({ checked, onChange }) {
  return (
    <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      style={{ width: 36, height: 19, borderRadius: 10, border: 'none', cursor: 'pointer', flexShrink: 0, backgroundColor: checked ? '#d0d0d0' : '#252525', position: 'relative', transition: 'background-color 200ms' }}>
      <span style={{ position: 'absolute', top: 2, left: checked ? 18 : 2, width: 15, height: 15, borderRadius: '50%', backgroundColor: checked ? '#0a0a0a' : '#505050', transition: 'left 200ms cubic-bezier(0.34,1.56,0.64,1)', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
    </button>
  );
}

export default function AvailabilityPage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [idx, setIdx] = useState(0);
  const [addingOv, setAddingOv] = useState(false);
  const [ovDate, setOvDate] = useState('');
  const [ovType, setOvType] = useState('block');
  const [ovStart, setOvStart] = useState('09:00');
  const [ovEnd, setOvEnd] = useState('17:00');

  useEffect(() => {
    getSchedules().then(setSchedules).catch(e => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

  const sch = schedules[idx];

  const updateRule = (dow, key, val) => {
    setSchedules(prev => prev.map((s, i) => i !== idx ? s : {
      ...s, rules: s.rules.map(r => r.day_of_week === dow ? { ...r, [key]: val } : r)
    }));
  };

  const save = async () => {
    setSaving(true);
    try { await updateSchedule(sch.id, { name: sch.name, timezone: sch.timezone, rules: sch.rules }); toast.success('Availability saved'); }
    catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const addOv = async () => {
    if (!ovDate) return toast.error('Select a date');
    try {
      const ov = await addDateOverride(sch.id, { date: ovDate, is_blocked: ovType === 'block', start_time: ovType === 'custom' ? ovStart : null, end_time: ovType === 'custom' ? ovEnd : null });
      setSchedules(prev => prev.map((s, i) => i !== idx ? s : { ...s, overrides: [...(s.overrides||[]), ov] }));
      setAddingOv(false); setOvDate('');
      toast.success('Override added');
    } catch (e) { toast.error(e.message); }
  };

  const removeOv = async id => {
    try {
      await deleteDateOverride(sch.id, id);
      setSchedules(prev => prev.map((s, i) => i !== idx ? s : { ...s, overrides: s.overrides.filter(o => o.id !== id) }));
      toast.success('Removed');
    } catch (e) { toast.error(e.message); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><span style={{ color: '#404040', fontSize: 14 }}>Loading...</span></div>;

  const timeSel = { padding: '6px 10px', backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 7, fontSize: 13, color: '#c0c0c0', cursor: 'pointer', fontFamily: 'inherit' };

  return (
    <div style={{ animation: 'fadeIn 200ms ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 26, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 700, color: '#f0f0f0', letterSpacing: '-0.4px', marginBottom: 4 }}>Availability</h1>
          <p style={{ fontSize: 13, color: '#505050' }}>Configure when you're available for bookings.</p>
        </div>
        <Button onClick={save} loading={saving} size="sm"><Save size={13} /> Save changes</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '196px 1fr', gap: 18, alignItems: 'start' }}>
        {/* Schedule list */}
        <div style={{ backgroundColor: '#111', border: '1px solid #1f1f1f', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '9px 13px', fontSize: 10, fontWeight: 600, color: '#3a3a3a', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #1a1a1a' }}>Schedules</div>
          {schedules.map((s, i) => (
            <button key={s.id} onClick={() => setIdx(i)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '11px 13px', border: 'none', background: 'none', cursor: 'pointer', borderLeft: `2px solid ${i===idx ? '#808080' : 'transparent'}`, backgroundColor: i===idx ? '#1a1a1a' : 'transparent', transition: 'background-color 150ms' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: i===idx ? '#e0e0e0' : '#606060' }}>{s.name}</div>
                {s.is_default && <div style={{ fontSize: 10, color: '#505050', marginTop: 2 }}>Default</div>}
              </div>
              <ChevronRight size={13} color="#3a3a3a" />
            </button>
          ))}
        </div>

        {sch && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Timezone */}
            <div style={{ backgroundColor: '#111', border: '1px solid #1f1f1f', borderRadius: 10, padding: 18 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#c0c0c0', marginBottom: 12 }}>Timezone</h3>
              <Select value={sch.timezone} onChange={e => setSchedules(prev => prev.map((s, i) => i===idx ? { ...s, timezone: e.target.value } : s))}>
                {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </Select>
            </div>

            {/* Weekly hours */}
            <div style={{ backgroundColor: '#111', border: '1px solid #1f1f1f', borderRadius: 10, padding: 18 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#c0c0c0', marginBottom: 4 }}>Weekly hours</h3>
              <p style={{ fontSize: 12, color: '#404040', marginBottom: 16 }}>Set your available hours for each day of the week.</p>
              {DAY_NAMES.map((day, dow) => {
                const rule = sch.rules?.find(r => r.day_of_week === dow) || { day_of_week: dow, start_time: '09:00', end_time: '17:00', is_available: false };
                return (
                  <div key={dow} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid #141414' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11, width: 170 }}>
                      <Toggle checked={!!rule.is_available} onChange={v => updateRule(dow, 'is_available', v)} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: rule.is_available ? '#d0d0d0' : '#383838' }}>{day}</span>
                    </div>
                    {rule.is_available ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <select value={rule.start_time?.substring(0,5)||'09:00'} onChange={e => updateRule(dow,'start_time',e.target.value)} style={timeSel}>
                          {TIMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <span style={{ color: '#383838', fontSize: 13 }}>–</span>
                        <select value={rule.end_time?.substring(0,5)||'17:00'} onChange={e => updateRule(dow,'end_time',e.target.value)} style={timeSel}>
                          {TIMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: '#2a2a2a' }}>Unavailable</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Date overrides */}
            <div style={{ backgroundColor: '#111', border: '1px solid #1f1f1f', borderRadius: 10, padding: 18 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#c0c0c0', marginBottom: 4 }}>Date overrides</h3>
              <p style={{ fontSize: 12, color: '#404040', marginBottom: 14 }}>Block specific dates or set custom hours for a day.</p>
              {sch.overrides?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
                  {sch.overrides.map(ov => (
                    <div key={ov.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', backgroundColor: '#1a1a1a', borderRadius: 8, border: '1px solid #1f1f1f' }}>
                      <span style={{ flex: 1, fontSize: 13, color: '#909090', fontWeight: 500 }}>
                        {new Date(ov.date).toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })}
                      </span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, backgroundColor: '#202020', border: '1px solid #2a2a2a', color: '#606060', fontWeight: 500 }}>
                        {ov.is_blocked ? 'Blocked' : `${ov.start_time?.substring(0,5)} – ${ov.end_time?.substring(0,5)}`}
                      </span>
                      <button onClick={() => removeOv(ov.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#3a3a3a', display: 'flex', padding: 3 }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {addingOv ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11, padding: 13, backgroundColor: '#1a1a1a', borderRadius: 8, border: '1px solid #252525' }}>
                  <input type="date" value={ovDate} onChange={e => setOvDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
                    style={{ padding: '8px 11px', backgroundColor: '#141414', border: '1px solid #2a2a2a', borderRadius: 7, fontSize: 13, color: '#c0c0c0', fontFamily: 'inherit' }} />
                  <Select value={ovType} onChange={e => setOvType(e.target.value)}>
                    <option value="block">Block this day</option>
                    <option value="custom">Custom hours</option>
                  </Select>
                  {ovType === 'custom' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <select value={ovStart} onChange={e => setOvStart(e.target.value)} style={timeSel}>{TIMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
                      <span style={{ color: '#383838' }}>–</span>
                      <select value={ovEnd} onChange={e => setOvEnd(e.target.value)} style={timeSel}>{TIMES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="sm" onClick={addOv}>Add override</Button>
                    <Button size="sm" variant="secondary" onClick={() => setAddingOv(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => setAddingOv(true)}><Plus size={12} /> Add override</Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}