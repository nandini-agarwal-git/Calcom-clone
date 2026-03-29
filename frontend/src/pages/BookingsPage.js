import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, X, ChevronDown, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { getBookings, cancelBooking } from '../utils/api';
import { getDateLabel, formatTime, getDuration, isDatePast } from '../utils/helpers';
import { Spinner, Avatar } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { Input } from '../components/ui/Input';

const TABS = [{ key:'upcoming',label:'Upcoming' },{ key:'past',label:'Past' },{ key:'cancelled',label:'Cancelled' }];

export default function BookingsPage() {
  const [tab, setTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');

  const load = t => {
    setLoading(true);
    const p = {};
    if (t === 'upcoming') p.upcoming = 'true';
    if (t === 'past') p.upcoming = 'false';
    if (t === 'cancelled') p.status = 'cancelled';
    getBookings(p).then(data => {
      if (t === 'cancelled') setBookings(data.filter(b => b.status === 'cancelled'));
      else if (t === 'upcoming') setBookings(data.filter(b => !['cancelled','rescheduled'].includes(b.status)));
      else setBookings(data.filter(b => !['cancelled','rescheduled'].includes(b.status)));
    }).catch(e => toast.error(e.message)).finally(() => setLoading(false));
  };
  useEffect(() => { load(tab); }, [tab]);

  const doCancel = async () => {
    setCancelling(true);
    try {
      await cancelBooking(cancelTarget.id, { cancellation_reason: cancelReason });
      setBookings(prev => prev.filter(b => b.id !== cancelTarget.id));
      toast.success('Booking cancelled');
      setCancelTarget(null); setCancelReason('');
    } catch (e) { toast.error(e.message); }
    finally { setCancelling(false); }
  };

  /* grayscale status label only — no colored badges */
  const statusLabel = status => {
    const map = { confirmed: 'Confirmed', pending: 'Pending', cancelled: 'Cancelled', rescheduled: 'Rescheduled' };
    return <span style={{ fontSize: 12, fontWeight: 500, color: '#606060', padding: '2px 9px', borderRadius: 20, backgroundColor: '#1e1e1e', border: '1px solid #2a2a2a' }}>{map[status] || status}</span>;
  };

  const filtered = bookings.filter(b =>
    b.booker_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.event_title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ animation: 'fadeIn 200ms ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 700, color: '#f0f0f0', letterSpacing: '-0.4px', marginBottom: 4 }}>Bookings</h1>
          <p style={{ fontSize: 13, color: '#a0a0a0' }}>See upcoming and past events booked on your calendar.</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={13} color="#404040" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bookings..." style={{ padding: '8px 12px 8px 30px', backgroundColor: '#1c1c1c', border: '1px solid #2a2a2a', borderRadius: 7, fontSize: 13, color: '#c0c0c0', width: 210, outline: 'none', fontFamily: 'inherit' }} />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1f1f1f', marginBottom: 22 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '10px 18px', fontSize: 13, fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', color: tab===t.key ? '#f0f0f0' : '#808080', borderBottom: `2px solid ${tab===t.key ? '#808080' : 'transparent'}`, marginBottom: -1, transition: 'all 150ms', fontFamily: 'inherit' }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}><Spinner size={26} /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <Calendar size={28} color="#252525" />
          <p style={{ color: '#909090', fontSize: 14 }}>No {tab} bookings</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {filtered.map(b => (
            <div key={b.id} style={{ display: 'flex', backgroundColor: '#111', border: '1px solid #1f1f1f', borderRadius: 10, overflow: 'hidden' }}>
              {/* Left accent bar - grayscale */}
              <div style={{ width: 3, flexShrink: 0, backgroundColor: '#303030' }} />
              <div style={{ flex: 1, padding: '13px 17px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={b.booker_name} size={32} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#e0e0e0' }}>{b.booker_name}</div>
                      <div style={{ fontSize: 12, color: '#909090', marginTop: 1 }}>{b.event_title}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {statusLabel(b.status)}
                    <button onClick={() => setExpanded(expanded===b.id ? null : b.id)}
                      style={{ width: 27, height: 27, borderRadius: 6, border: '1px solid #252525', backgroundColor: '#1a1a1a', color: '#505050', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ChevronDown size={14} style={{ transform: expanded===b.id ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }} />
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
                  {[
                    [Calendar, getDateLabel(b.start_time)],
                    [Clock, `${formatTime(b.start_time)} – ${formatTime(b.end_time)}`],
                    [Clock, getDuration(b.duration)],
                    ...(b.location ? [[MapPin, b.location]] : []),
                  ].map(([Icon, val], i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#a0a0a0' }}>
                      <Icon size={11} />{val}
                    </span>
                  ))}
                </div>
                {expanded === b.id && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #1a1a1a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                      <span style={{ fontSize: 12, color: '#909090', width: 55 }}>Email</span>
                      <span style={{ fontSize: 13, color: '#808080' }}>{b.booker_email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: '#909090', width: 55 }}>ID</span>
                      <span style={{ fontSize: 11, color: '#707070', fontFamily: 'monospace' }}>{b.uid}</span>
                    </div>
                    {b.status !== 'cancelled' && !isDatePast(b.end_time) && (
                      <button onClick={() => setCancelTarget(b)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 6, border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#707070', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                        <X size={11} /> Cancel booking
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!cancelTarget} onClose={() => { setCancelTarget(null); setCancelReason(''); }} title="Cancel booking" size="sm">
        <p style={{ fontSize: 14, color: '#808080', marginBottom: 16, lineHeight: 1.6 }}>
          Cancel <strong style={{ color: '#c0c0c0' }}>{cancelTarget?.event_title}</strong> with <strong style={{ color: '#c0c0c0' }}>{cancelTarget?.booker_name}</strong>?
        </p>
        <Input label="Reason (optional)" value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Let them know why..." />
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
          <button onClick={() => setCancelTarget(null)} style={{ padding: '8px 16px', borderRadius: 7, border: '1px solid #2a2a2a', backgroundColor: 'transparent', color: '#707070', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Keep</button>
          <button onClick={doCancel} disabled={cancelling} style={{ padding: '8px 16px', borderRadius: 7, border: '1px solid #383838', backgroundColor: '#252525', color: '#c0c0c0', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {cancelling ? 'Cancelling...' : 'Cancel booking'}
          </button>
        </div>
      </Modal>
    </div>
  );
}