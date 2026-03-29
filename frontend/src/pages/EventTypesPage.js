import React, { useState, useEffect, useRef } from 'react';
import { Plus, Link2, Edit2, Trash2, ExternalLink, MoreHorizontal, Clock, Video, Phone, MapPin, Search, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { getEventTypes, deleteEventType, toggleEventType } from '../utils/api';
import { getDuration } from '../utils/helpers';
import { Spinner } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import EventTypeForm from '../components/dashboard/EventTypeForm';

function Toggle({ checked, onChange }) {
  return (
    <button role="switch" aria-checked={checked} onClick={e => { e.stopPropagation(); onChange(!checked); }}
      style={{ width: 38, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', flexShrink: 0, backgroundColor: checked ? '#e0e0e0' : '#2a2a2a', position: 'relative', transition: 'background-color 200ms' }}>
      <span style={{ position: 'absolute', top: 2, left: checked ? 20 : 2, width: 16, height: 16, borderRadius: '50%', backgroundColor: checked ? '#0a0a0a' : '#555', transition: 'left 200ms cubic-bezier(0.34,1.56,0.64,1)', boxShadow: '0 1px 3px rgba(0,0,0,0.5)' }} />
    </button>
  );
}

function DropdownMenu({ items, onClose }) {
  const ref = useRef();
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);
  return (
    <div ref={ref} style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, zIndex: 50, backgroundColor: '#1c1c1c', border: '1px solid #2a2a2a', borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.6)', minWidth: 155, padding: 4, animation: 'slideUp 120ms ease-out' }}>
      {items.map((item, i) => item === 'divider'
        ? <div key={i} style={{ height: 1, backgroundColor: '#222', margin: '3px 0' }} />
        : <button key={item.label} onClick={item.onClick}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 11px', borderRadius: 6, fontSize: 13, color: '#a0a0a0', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'background-color 150ms' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#252525'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {item.icon && <item.icon size={13} />}{item.label}
          </button>
      )}
    </div>
  );
}

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [search, setSearch] = useState('');
  const BASE = process.env.REACT_APP_BASE_URL || window.location.origin;

  const load = () => { setLoading(true); getEventTypes().then(setEventTypes).catch(e => toast.error(e.message)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const handleToggle = async id => {
    try {
      const u = await toggleEventType(id);
      setEventTypes(prev => prev.map(et => et.id === id ? { ...et, is_active: u.is_active } : et));
    } catch (e) { toast.error(e.message); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEventType(deleteTarget.id);
      setEventTypes(prev => prev.filter(et => et.id !== deleteTarget.id));
      toast.success('Deleted'); setDeleteTarget(null);
    } catch (e) { toast.error(e.message); }
    finally { setDeleting(false); }
  };

  const copyLink = et => { navigator.clipboard.writeText(`${BASE}/book/alex/${et.slug}`); toast.success('Link copied'); };
  const filtered = eventTypes.filter(et => et.title.toLowerCase().includes(search.toLowerCase()));
  const locIcon = { video: Video, phone: Phone, in_person: MapPin, default: MapPin };

  return (
    <div style={{ animation: 'fadeIn 200ms ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 26, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 700, color: '#f0f0f0', letterSpacing: '-0.4px', marginBottom: 4 }}>Event types</h1>
          <p style={{ fontSize: 13, color: '#505050' }}>Configure different events for people to book on your calendar.</p>
        </div>
        <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={13} color="#404040" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." style={{ padding: '8px 12px 8px 30px', backgroundColor: '#1c1c1c', border: '1px solid #2a2a2a', borderRadius: 7, fontSize: 13, color: '#c0c0c0', width: 190, outline: 'none', fontFamily: 'inherit' }} />
          </div>
          <button onClick={() => { setEditItem(null); setShowForm(true); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 7, backgroundColor: '#e8e8e8', color: '#0a0a0a', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            <Plus size={14} /> New
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Spinner size={28} /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: '#181818', border: '1px solid #252525', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Clock size={22} color="#404040" /></div>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#c0c0c0', marginBottom: 7 }}>No event types</h3>
          <p style={{ fontSize: 13, color: '#404040', marginBottom: 22 }}>Create your first event type to start accepting bookings.</p>
          <button onClick={() => { setEditItem(null); setShowForm(true); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 7, backgroundColor: '#e8e8e8', color: '#0a0a0a', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
            <Plus size={13} /> Create event type
          </button>
        </div>
      ) : (
        <div style={{ border: '1px solid #1f1f1f', borderRadius: 11, overflow: 'hidden', backgroundColor: '#111' }}>
          {filtered.map((et, idx) => {
            const LocIcon = locIcon[et.location_type] || locIcon.default;
            return (
              <div key={et.id} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '15px 18px', borderBottom: idx < filtered.length-1 ? '1px solid #1a1a1a' : 'none', opacity: et.is_active ? 1 : 0.5, transition: 'background-color 150ms' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#141414'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {/* Color indicator */}
                <div style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: et.color || '#505050', flexShrink: 0 }} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#e8e8e8' }}>{et.title}</span>
                    <span style={{ fontSize: 12, color: '#3a3a3a', fontFamily: 'monospace' }}>/alex/{et.slug}</span>
                    {!et.is_active && <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 20, backgroundColor: '#1a1a1a', border: '1px solid #252525', color: '#505050', fontWeight: 500 }}>Hidden</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 5, flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#4a4a4a' }}><Clock size={11} /> {getDuration(et.duration)}</span>
                    {et.location && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#4a4a4a' }}><LocIcon size={11} /> {et.location}</span>}
                    {et.upcoming_bookings > 0 && <span style={{ fontSize: 12, color: '#707070' }}>{et.upcoming_bookings} upcoming</span>}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                  <Toggle checked={et.is_active} onChange={() => handleToggle(et.id)} />
                  {[
                    { icon: ExternalLink, title: 'Preview', onClick: () => window.open(`${BASE}/book/alex/${et.slug}`, '_blank') },
                    { icon: Link2,        title: 'Copy link', onClick: () => copyLink(et) },
                  ].map(({ icon: Icon, title, onClick }) => (
                    <button key={title} onClick={onClick} title={title}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, color: '#4a4a4a', border: '1px solid #252525', background: '#1a1a1a', cursor: 'pointer', transition: 'all 150ms' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#a0a0a0'; e.currentTarget.style.borderColor = '#383838'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#4a4a4a'; e.currentTarget.style.borderColor = '#252525'; }}
                    >
                      <Icon size={13} />
                    </button>
                  ))}
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => setMenuOpen(menuOpen === et.id ? null : et.id)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 6, color: '#4a4a4a', border: '1px solid #252525', background: '#1a1a1a', cursor: 'pointer' }}>
                      <MoreHorizontal size={13} />
                    </button>
                    {menuOpen === et.id && (
                      <DropdownMenu onClose={() => setMenuOpen(null)} items={[
                        { label: 'Edit',       icon: Edit2,        onClick: () => { setEditItem(et); setShowForm(true); setMenuOpen(null); } },
                        { label: 'Copy link',  icon: Copy,         onClick: () => { copyLink(et); setMenuOpen(null); } },
                        { label: 'Preview',    icon: ExternalLink, onClick: () => { window.open(`${BASE}/book/alex/${et.slug}`, '_blank'); setMenuOpen(null); } },
                        'divider',
                        { label: 'Delete',     icon: Trash2,       onClick: () => { setDeleteTarget(et); setMenuOpen(null); } },
                      ]} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditItem(null); }} title={editItem ? 'Edit event type' : 'Add new event type'} size="lg">
        <EventTypeForm
          initial={editItem}
          onSaved={saved => {
            if (editItem) setEventTypes(prev => prev.map(et => et.id === saved.id ? saved : et));
            else setEventTypes(prev => [...prev, saved]);
            setShowForm(false); setEditItem(null);
            toast.success(editItem ? 'Saved!' : 'Event type created!');
          }}
          onCancel={() => { setShowForm(false); setEditItem(null); }}
        />
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete event type" size="sm">
        <p style={{ fontSize: 14, color: '#808080', marginBottom: 22, lineHeight: 1.6 }}>
          Are you sure you want to delete <strong style={{ color: '#c0c0c0' }}>{deleteTarget?.title}</strong>? This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={() => setDeleteTarget(null)} style={{ padding: '8px 16px', borderRadius: 7, border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#808080', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
          <button onClick={handleDelete} disabled={deleting} style={{ padding: '8px 16px', borderRadius: 7, border: '1px solid #383838', backgroundColor: '#252525', color: '#c0c0c0', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
}