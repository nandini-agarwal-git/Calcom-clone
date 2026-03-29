import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Input, Textarea, Select } from '../ui/Input';
import Button from '../ui/Button';
import { createEventType, updateEventType } from '../../utils/api';
import { slugify, DURATION_OPTIONS, timezones } from '../../utils/helpers';

/* strict grayscale color swatches */
const COLORS = [
  { value: '#ffffff', label: 'White' },
  { value: '#d0d0d0', label: 'Light gray' },
  { value: '#a0a0a0', label: 'Gray' },
  { value: '#707070', label: 'Dark gray' },
  { value: '#404040', label: 'Charcoal' },
  { value: '#202020', label: 'Near black' },
  { value: '#0a0a0a', label: 'Black' },
];

const TABS = ['Basic info', 'Limits', 'Questions'];

export default function EventTypeForm({ initial, onSaved, onCancel }) {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({
    title: '', description: '', slug: '', duration: 30,
    color: '#a0a0a0', location_type: 'video', location: 'Zoom Meeting',
    buffer_time_before: 0, buffer_time_after: 0,
    min_booking_notice: 60, max_booking_days: 60,
    requires_confirmation: false, custom_questions: [],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) setForm({ ...form, ...initial, custom_questions: initial.custom_questions || [] });
  }, [initial?.id]);

  const set = (k, v) => {
    setForm(f => {
      const n = { ...f, [k]: v };
      if (k === 'title' && !initial) n.slug = slugify(v);
      return n;
    });
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Required';
    if (!form.slug.trim()) e.slug = 'Required';
    if (!/^[a-z0-9-]+$/.test(form.slug)) e.slug = 'Lowercase letters, numbers and hyphens only';
    if (!form.duration || form.duration < 5) e.duration = 'Minimum 5 min';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const saved = initial ? await updateEventType(initial.id, form) : await createEventType(form);
      onSaved(saved);
    } catch (err) { setErrors({ _: err.message }); }
    finally { setLoading(false); }
  };

  const addQ = () => setForm(f => ({ ...f, custom_questions: [...f.custom_questions, { id: Date.now().toString(), label: '', type: 'text', required: false }] }));
  const removeQ = (id) => setForm(f => ({ ...f, custom_questions: f.custom_questions.filter(q => q.id !== id) }));
  const setQ = (id, k, v) => setForm(f => ({ ...f, custom_questions: f.custom_questions.map(q => q.id === id ? { ...q, [k]: v } : q) }));

  return (
    <form onSubmit={submit}>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 22, backgroundColor: '#181818', borderRadius: 9, padding: 3 }}>
        {TABS.map((t, i) => (
          <button key={t} type="button" onClick={() => setTab(i)}
            style={{ flex: 1, padding: '7px 10px', borderRadius: 7, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 150ms', color: tab===i ? '#e0e0e0' : '#505050', backgroundColor: tab===i ? '#252525' : 'transparent' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div style={S.fields}>
          <Input label="Event name *" value={form.title} onChange={e => set('title', e.target.value)} error={errors.title} placeholder="e.g. 30 min meeting" />
          <div style={S.two}>
            <div>
              <label style={S.label}>URL slug *</label>
              <div style={{ display: 'flex', alignItems: 'stretch', border: '1px solid #2a2a2a', borderRadius: 8, overflow: 'hidden', backgroundColor: '#1a1a1a' }}>
                <span style={{ padding: '9px 10px', fontSize: 12, color: '#505050', backgroundColor: '#141414', borderRight: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>cal.clone/alex/</span>
                <input value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="30min"
                  style={{ flex: 1, padding: '9px 11px', backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: '#e8e8e8', fontFamily: 'inherit' }} />
              </div>
              {errors.slug && <p style={S.err}>{errors.slug}</p>}
            </div>
            <Select label="Duration *" value={form.duration} onChange={e => set('duration', Number(e.target.value))} error={errors.duration}>
              {DURATION_OPTIONS.map(d => <option key={d} value={d}>{d} minutes</option>)}
            </Select>
          </div>
          <Textarea label="Description" value={form.description || ''} onChange={e => set('description', e.target.value)} placeholder="A short description shown on your booking page." rows={3} />
          <div style={S.two}>
            <Select label="Meeting type" value={form.location_type} onChange={e => set('location_type', e.target.value)}>
              <option value="video">Video call</option>
              <option value="phone">Phone call</option>
              <option value="in_person">In person</option>
              <option value="other">Other</option>
            </Select>
            <Input label="Location" value={form.location || ''} onChange={e => set('location', e.target.value)} placeholder="Zoom, Google Meet, etc." />
          </div>
          <div>
            <label style={S.label}>Color indicator</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {COLORS.map(c => (
                <button key={c.value} type="button" onClick={() => set('color', c.value)} title={c.label}
                  style={{ width: 26, height: 26, borderRadius: '50%', border: form.color === c.value ? '3px solid #e0e0e0' : '2px solid #303030', backgroundColor: c.value, cursor: 'pointer', transform: form.color === c.value ? 'scale(1.2)' : 'none', transition: 'all 150ms' }} />
              ))}
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.requires_confirmation} onChange={e => set('requires_confirmation', e.target.checked)} style={{ width: 15, height: 15, accentColor: '#e0e0e0' }} />
            <span style={{ fontSize: 13, color: '#808080' }}>Require manual confirmation before booking is confirmed</span>
          </label>
        </div>
      )}

      {tab === 1 && (
        <div style={S.fields}>
          <div style={{ padding: '10px 13px', backgroundColor: '#181818', border: '1px solid #252525', borderRadius: 8, fontSize: 13, color: '#606060' }}>Limits control how far in advance someone can book and how much notice you need.</div>
          <div style={S.two}>
            <Select label="Minimum notice" value={form.min_booking_notice} onChange={e => set('min_booking_notice', Number(e.target.value))}>
              <option value={0}>None</option><option value={30}>30 min</option><option value={60}>1 hour</option>
              <option value={120}>2 hours</option><option value={1440}>1 day</option><option value={2880}>2 days</option>
            </Select>
            <Select label="Booking window" value={form.max_booking_days} onChange={e => set('max_booking_days', Number(e.target.value))}>
              <option value={7}>1 week</option><option value={14}>2 weeks</option><option value={30}>1 month</option>
              <option value={60}>2 months</option><option value={90}>3 months</option><option value={180}>6 months</option>
            </Select>
          </div>
          <div style={S.two}>
            <Select label="Buffer before" value={form.buffer_time_before} onChange={e => set('buffer_time_before', Number(e.target.value))}>
              <option value={0}>None</option><option value={5}>5 min</option><option value={10}>10 min</option><option value={15}>15 min</option><option value={30}>30 min</option>
            </Select>
            <Select label="Buffer after" value={form.buffer_time_after} onChange={e => set('buffer_time_after', Number(e.target.value))}>
              <option value={0}>None</option><option value={5}>5 min</option><option value={10}>10 min</option><option value={15}>15 min</option><option value={30}>30 min</option>
            </Select>
          </div>
        </div>
      )}

      {tab === 2 && (
        <div style={S.fields}>
          <div style={{ padding: '10px 13px', backgroundColor: '#181818', border: '1px solid #252525', borderRadius: 8, fontSize: 13, color: '#606060' }}>Name and email are always collected. Add extra questions below.</div>
          {form.custom_questions.map(q => (
            <div key={q.id} style={{ padding: 13, backgroundColor: '#181818', borderRadius: 8, border: '1px solid #252525' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}><Input value={q.label} onChange={e => setQ(q.id, 'label', e.target.value)} placeholder="Question..." /></div>
                <Select value={q.type} onChange={e => setQ(q.id, 'type', e.target.value)} style={{ width: 120 }}>
                  <option value="text">Short text</option>
                  <option value="textarea">Long text</option>
                  <option value="select">Dropdown</option>
                </Select>
                <button type="button" onClick={() => removeQ(q.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 36, borderRadius: 7, border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#606060', cursor: 'pointer', flexShrink: 0 }}>
                  <Trash2 size={13} />
                </button>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 9, cursor: 'pointer' }}>
                <input type="checkbox" checked={q.required} onChange={e => setQ(q.id, 'required', e.target.checked)} style={{ accentColor: '#e0e0e0' }} />
                <span style={{ fontSize: 12, color: '#606060' }}>Required</span>
              </label>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={addQ}><Plus size={13} /> Add question</Button>
        </div>
      )}

      {errors._ && <div style={{ padding: '10px 13px', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: 8, fontSize: 13, color: '#909090', marginTop: 14 }}>{errors._}</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22, paddingTop: 18, borderTop: '1px solid #1f1f1f' }}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{initial ? 'Save changes' : 'Create event type'}</Button>
      </div>
    </form>
  );
}

const S = {
  fields: { display: 'flex', flexDirection: 'column', gap: 15 },
  two:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  label:  { display: 'block', fontSize: 13, fontWeight: 500, color: '#909090', marginBottom: 6 },
  err:    { fontSize: 12, color: '#808080', marginTop: 4 },
};