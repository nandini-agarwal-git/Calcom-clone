import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Clock, Video, Phone, MapPin, Globe, Zap } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameDay, isBefore, addDays } from 'date-fns';
import toast from 'react-hot-toast';
import { getPublicEventType, getAvailableDates, getAvailableSlots, createBooking } from '../utils/api';
import { getDuration } from '../utils/helpers';
import { Spinner } from '../components/ui/Badge';
import { Input, Textarea } from '../components/ui/Input';

export default function PublicBookingPage() {
  const { username, slug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date());
  const [availDates, setAvailDates] = useState([]);
  const [selDate, setSelDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selSlot, setSelSlot] = useState(null);
  const [step, setStep] = useState('calendar');
  const [form, setForm] = useState({ name:'', email:'', phone:'', notes:'' });
  const [answers, setAnswers] = useState({});
  const [errs, setErrs] = useState({});
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = '#0a0a0a';
    getPublicEventType(username, slug).then(setData).catch(e => toast.error(e.message)).finally(() => setLoading(false));
    return () => { document.body.style.backgroundColor = ''; };
  }, [username, slug]);

  const loadDates = useCallback(async m => {
    if (!data) return;
    try { const r = await getAvailableDates(username, slug, m.getMonth()+1, m.getFullYear()); setAvailDates(r.availableDates||[]); }
    catch (e) {}
  }, [data, username, slug]);

  useEffect(() => { loadDates(month); }, [month, loadDates]);

  const pickDate = async date => {
    setSelDate(date); setSelSlot(null); setSlotsLoading(true);
    try { const r = await getAvailableSlots(username, slug, format(date,'yyyy-MM-dd')); setSlots(r.slots?.filter(s=>s.available)||[]); }
    catch (e) { toast.error(e.message); }
    finally { setSlotsLoading(false); }
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    data?.eventType?.custom_questions?.forEach(q => { if (q.required && !answers[q.id]?.trim()) e[`q_${q.id}`] = 'Required'; });
    setErrs(e); return Object.keys(e).length === 0;
  };

  const submitBooking = async e => {
    e.preventDefault();
    if (!validate()) return;
    setBooking(true);
    try {
      const result = await createBooking(username, slug, { start_time: selSlot.time, booker_name: form.name, booker_email: form.email, booker_phone: form.phone, notes: form.notes, custom_answers: answers });
      navigate('/booking/confirmed', { state: { booking: result } });
    } catch (err) { toast.error(err.message); }
    finally { setBooking(false); }
  };

  if (loading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#0a0a0a' }}><Spinner size={30} /></div>;
  if (!data) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#0a0a0a' }}><p style={{ color:'#404040' }}>Event not found</p></div>;

  const { user, eventType: et } = data;
  const LocIcon = { video: Video, phone: Phone, default: MapPin }[et.location_type] || MapPin;
  const today = new Date(); today.setHours(0,0,0,0);
  const monthStart = startOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: endOfMonth(month) });
  const offset = getDay(monthStart);
  const isAvail = d => availDates.includes(format(d,'yyyy-MM-dd'));
  const isPrev = isBefore(addMonths(monthStart,0), today);

  const iconBtn = { display:'flex', alignItems:'center', justifyContent:'center', width:29, height:29, borderRadius:7, border:'1px solid #252525', backgroundColor:'#1a1a1a', color:'#505050', cursor:'pointer' };
  const timeSel = { padding:'9px 8px', border:'1px solid #252525', borderRadius:8, backgroundColor:'#1a1a1a', fontSize:13, fontWeight:500, color:'#a0a0a0', cursor:'pointer', transition:'all 150ms', fontFamily:'inherit' };
  const timeSelAct = { ...timeSel, backgroundColor:'#d8d8d8', borderColor:'#d8d8d8', color:'#0a0a0a' };

  return (
    <div style={{ minHeight:'100vh', backgroundColor:'#0a0a0a' }}>
      <nav style={{ padding:'13px 22px', borderBottom:'1px solid #1a1a1a', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Link to={`/book/${username}`} style={{ display:'flex', alignItems:'center', gap:4, fontSize:13, color:'#505050', textDecoration:'none' }}>
          <ChevronLeft size={15} /> Back
        </Link>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:7, textDecoration:'none' }}>
          <div style={{ width:23, height:23, borderRadius:6, backgroundColor:'#e0e0e0', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Zap size={11} color="#0a0a0a" fill="#0a0a0a" />
          </div>
          <span style={{ fontSize:13, fontWeight:700, color:'#c0c0c0' }}>Cal.clone</span>
        </Link>
      </nav>

      <div style={{ maxWidth:780, margin:'0 auto', padding:'28px 22px' }}>
        <div style={{ backgroundColor:'#111', border:'1px solid #1f1f1f', borderRadius:14, display:'grid', gridTemplateColumns:'250px 1fr', overflow:'hidden', boxShadow:'0 20px 40px rgba(0,0,0,0.4)' }}>
          {/* Left */}
          <div style={{ padding:'26px 22px', borderRight:'1px solid #1a1a1a', backgroundColor:'#0d0d0d' }}>
            <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:22 }}>
              <div style={{ width:33, height:33, borderRadius:'50%', backgroundColor:'#1e1e1e', border:'1px solid #2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#707070' }}>
                {user.name?.[0]}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:'#c0c0c0' }}>{user.name}</div>
                <div style={{ fontSize:11, color:'#808080' }}>@{user.username}</div>
              </div>
            </div>
            <div style={{ width:9, height:9, borderRadius:'50%', backgroundColor:'#505050', marginBottom:11 }} />
            <h1 style={{ fontSize:18, fontWeight:700, color:'#e8e8e8', letterSpacing:'-0.4px', marginBottom:9, lineHeight:1.3 }}>{et.title}</h1>
            {et.description && <p style={{ fontSize:13, color:'#505050', lineHeight:1.6, marginBottom:18 }}>{et.description}</p>}
            <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
              {[[Clock, getDuration(et.duration)], et.location && [LocIcon, et.location], [Globe, user.timezone]].filter(Boolean).map(([Icon, val], i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#a0a0a0' }}><Icon size={14} color="#404040" /><span>{val}</span></div>
              ))}
            </div>
            {selDate && selSlot && (
              <div style={{ marginTop:22, padding:13, backgroundColor:'#1a1a1a', borderRadius:9, border:'1px solid #252525' }}>
                <div style={{ fontSize:11, fontWeight:600, color:'#505050', marginBottom:4 }}>{format(selDate,'EEEE, MMMM d')}</div>
                <div style={{ fontSize:18, fontWeight:700, color:'#c0c0c0' }}>{selSlot.display}</div>
                <div style={{ fontSize:12, color:'#808080', marginTop:3 }}>{getDuration(et.duration)}</div>
              </div>
            )}
          </div>

          {/* Right */}
          <div style={{ padding:'26px 26px' }}>
            {step === 'calendar' ? (
              <div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
                  <h2 style={{ fontSize:15, fontWeight:600, color:'#d0d0d0' }}>{format(month,'MMMM yyyy')}</h2>
                  <div style={{ display:'flex', gap:5 }}>
                    <button style={iconBtn} onClick={() => setMonth(m => subMonths(m,1))}><ChevronLeft size={15} /></button>
                    <button style={iconBtn} onClick={() => setMonth(m => addMonths(m,1))}><ChevronRight size={15} /></button>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:7 }}>
                  {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d => (
                    <div key={d} style={{ textAlign:'center', fontSize:10, fontWeight:600, color:'#707070', padding:'3px 0', letterSpacing:'0.06em' }}>{d}</div>
                  ))}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, marginBottom:20 }}>
                  {Array.from({ length: offset }).map((_,i) => <div key={`e${i}`} />)}
                  {days.map(d => {
                    const avail = !isBefore(d, today) && isAvail(d);
                    const sel = selDate && isSameDay(d, selDate);
                    const tod = isToday(d);
                    return (
                      <button key={d.toISOString()} disabled={!avail} onClick={() => avail && pickDate(d)} style={{
                        aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', fontSize:13, border:'none', background:'none', cursor: avail ? 'pointer' : 'default', fontFamily:'inherit',
                        color: sel ? '#0a0a0a' : avail ? '#f0f0f0' : '#a0a0a0',
                        backgroundColor: sel ? '#d0d0d0' : 'transparent',
                        fontWeight: avail ? 500 : 400,
                        outline: tod && !sel ? '1px solid #404040' : 'none',
                      }}>{d.getDate()}</button>
                    );
                  })}
                </div>

                {selDate && (
                  <div style={{ borderTop:'1px solid #1a1a1a', paddingTop:18 }}>
                    <h3 style={{ fontSize:14, fontWeight:600, color:'#c0c0c0', marginBottom:13 }}>{format(selDate,'EEEE, MMMM d')}</h3>
                    {slotsLoading ? (
                      <div style={{ display:'flex', justifyContent:'center', padding:22 }}><Spinner /></div>
                    ) : slots.length === 0 ? (
                      <p style={{ fontSize:13, color:'#909090' }}>No available times.</p>
                    ) : (
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:7 }}>
                        {slots.map((s,i) => (
                          <button key={i} onClick={() => setSelSlot(s)} style={selSlot?.time===s.time ? timeSelAct : timeSel}>{s.display}</button>
                        ))}
                      </div>
                    )}
                    {selSlot && (
                      <button onClick={() => setStep('form')} style={{ marginTop:16, width:'100%', padding:'11px', borderRadius:8, border:'none', backgroundColor:'#d8d8d8', color:'#0a0a0a', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                        Continue →
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <button onClick={() => setStep('calendar')} style={{ display:'flex', alignItems:'center', gap:4, fontSize:13, color:'#505050', border:'none', background:'none', cursor:'pointer', marginBottom:16, fontFamily:'inherit', padding:0 }}>
                  <ChevronLeft size={14} /> Back
                </button>
                <h2 style={{ fontSize:17, fontWeight:700, color:'#d8d8d8', marginBottom:18 }}>Enter your details</h2>
                <form onSubmit={submitBooking} style={{ display:'flex', flexDirection:'column', gap:13 }}>
                  <Input label="Your name *" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} error={errs.name} placeholder="Jane Smith" />
                  <Input label="Email address *" type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} error={errs.email} placeholder="jane@example.com" />
                  <Input label="Phone (optional)" type="tel" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} placeholder="+1 (555) 000-0000" />
                  {et.custom_questions?.map(q => (
                    <div key={q.id}>
                      {q.type==='textarea' ? (
                        <Textarea label={q.label+(q.required?' *':'')} value={answers[q.id]||''} onChange={e => setAnswers(a=>({...a,[q.id]:e.target.value}))} error={errs[`q_${q.id}`]} />
                      ) : q.type==='select' ? (
                        <div>
                          <label style={{ display:'block', fontSize:13, fontWeight:500, color:'#909090', marginBottom:6 }}>{q.label}{q.required&&' *'}</label>
                          <select value={answers[q.id]||''} onChange={e => setAnswers(a=>({...a,[q.id]:e.target.value}))} style={{ width:'100%', padding:'9px 13px', backgroundColor:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:8, color:'#c0c0c0', fontSize:14, fontFamily:'inherit' }}>
                            <option value="">Select...</option>
                            {(q.options||[]).map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                          {errs[`q_${q.id}`] && <p style={{ fontSize:12, color:'#808080', marginTop:4 }}>{errs[`q_${q.id}`]}</p>}
                        </div>
                      ) : (
                        <Input label={q.label+(q.required?' *':'')} value={answers[q.id]||''} onChange={e => setAnswers(a=>({...a,[q.id]:e.target.value}))} error={errs[`q_${q.id}`]} />
                      )}
                    </div>
                  ))}
                  <Textarea label="Additional notes" value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} placeholder="Anything you'd like to share..." rows={2} />
                  <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', backgroundColor:'#1a1a1a', border:'1px solid #252525', borderRadius:8 }}>
                    <Clock size={12} color="#404040" />
                    <span style={{ fontSize:13, color:'#a0a0a0' }}>{format(selDate,'EEE, MMM d')} · {selSlot?.display} · {getDuration(et.duration)}</span>
                  </div>
                  <button type="submit" disabled={booking} style={{ width:'100%', padding:'11px', borderRadius:8, border:'none', backgroundColor: booking ? '#1e1e1e' : '#d8d8d8', color: booking ? '#505050' : '#0a0a0a', fontSize:14, fontWeight:600, cursor: booking ? 'not-allowed' : 'pointer', fontFamily:'inherit' }}>
                    {booking ? 'Booking...' : et.requires_confirmation ? 'Request booking' : 'Confirm booking'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ textAlign:'center', padding:'24px 0', fontSize:12, color:'#505050' }}>Powered by Cal.clone</div>
    </div>
  );
}