import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, MapPin, Video, Phone, ExternalLink, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { getDuration } from '../utils/helpers';

export default function BookingConfirmPage() {
  const { state } = useLocation();
  const booking = state?.booking;

  if (!booking) return (
    <div style={{ minHeight:'100vh', backgroundColor:'#0a0a0a', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
      <p style={{ color:'#404040', marginBottom:14 }}>No booking found.</p>
      <Link to="/" style={{ color:'#808080', fontSize:13 }}>← Go home</Link>
    </div>
  );

  const start = new Date(booking.start_time);
  const end   = new Date(booking.end_time);
  const pending = booking.status === 'pending';
  const LocIcon = booking.location_type === 'video' ? Video : booking.location_type === 'phone' ? Phone : MapPin;

  const addToGoogle = () => {
    const fmt = d => d.toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';
    const p = new URLSearchParams({ action:'TEMPLATE', text: booking.title||booking.event_title, dates:`${fmt(start)}/${fmt(end)}`, location: booking.location||'' });
    window.open(`https://calendar.google.com/calendar/render?${p}`,'_blank');
  };

  return (
    <div style={{ minHeight:'100vh', backgroundColor:'#0a0a0a' }}>
      <nav style={{ padding:'14px 22px', borderBottom:'1px solid #1a1a1a', display:'flex', alignItems:'center' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none' }}>
          <div style={{ width:24, height:24, borderRadius:6, backgroundColor:'#d0d0d0', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Zap size={11} color="#0a0a0a" fill="#0a0a0a" />
          </div>
          <span style={{ fontSize:14, fontWeight:700, color:'#c0c0c0' }}>Cal.clone</span>
        </Link>
      </nav>

      <div style={{ maxWidth:460, margin:'0 auto', padding:'38px 22px' }}>
        {/* Banner */}
        <div style={{ display:'flex', alignItems:'center', gap:13, padding:'16px 18px', backgroundColor:'#161616', border:'1px solid #252525', borderRadius:11, marginBottom:18 }}>
          <div style={{ width:44, height:44, borderRadius:'50%', backgroundColor:'#1e1e1e', border:'1px solid #2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <CheckCircle size={22} color={pending ? '#808080' : '#c0c0c0'} />
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'#e0e0e0', marginBottom:3 }}>
              {pending ? 'Booking requested' : 'Booking confirmed'}
            </div>
            <div style={{ fontSize:13, color:'#a0a0a0' }}>
              {pending ? 'Awaiting confirmation from the host.' : `Confirmation sent to ${booking.booker_email}`}
            </div>
          </div>
        </div>

        {/* Card */}
        <div style={{ backgroundColor:'#111', border:'1px solid #1f1f1f', borderRadius:13, padding:22, marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:11, marginBottom:18 }}>
            <h2 style={{ fontSize:17, fontWeight:700, color:'#e8e8e8', lineHeight:1.3 }}>{booking.event_title||booking.title}</h2>
            <span style={{ flexShrink:0, fontSize:11, fontWeight:500, padding:'3px 9px', borderRadius:20, backgroundColor:'#1e1e1e', border:'1px solid #2a2a2a', color:'#707070', whiteSpace:'nowrap' }}>
              {pending ? '⏳ Pending' : '✓ Confirmed'}
            </span>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
            {[
              { Icon: Calendar, label: 'Date',     val: format(start,'EEEE, MMMM d, yyyy') },
              { Icon: Clock,    label: 'Time',     val: `${format(start,'h:mm a')} – ${format(end,'h:mm a')}${booking.duration ? ` (${getDuration(booking.duration)})` : ''}` },
              ...(booking.location ? [{ Icon: LocIcon, label:'Location', val: booking.location }] : []),
              ...(booking.host_name ? [{ Icon: null, label:'Host', val: booking.host_name }] : []),
            ].map(({ Icon, label, val }) => (
              <div key={label} style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:11 }}>
                <div style={{ display:'flex', alignItems:'center', gap:7, minWidth:75 }}>
                  {Icon && <Icon size={14} color="#3a3a3a" />}
                  <span style={{ fontSize:11, fontWeight:600, color:'#808080', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</span>
                </div>
                <span style={{ fontSize:13, fontWeight:500, color:'#c0c0c0', textAlign:'right' }}>{val}</span>
              </div>
            ))}
          </div>

          <div style={{ height:1, backgroundColor:'#1a1a1a', margin:'18px 0' }} />

          <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
            {[['Name',booking.booker_name],['Email',booking.booker_email],['Booking ID',booking.uid]].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:12, color:'#909090' }}>{k}</span>
                <span style={{ fontSize:13, color:'#808080', fontWeight:500, ...(k==='Booking ID'?{fontFamily:'monospace',fontSize:11,color:'#707070'}:{}) }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display:'flex', flexDirection:'column', gap:10, alignItems:'center', marginBottom:28 }}>
          <button onClick={addToGoogle} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:9, border:'1px solid #252525', backgroundColor:'#1a1a1a', color:'#a0a0a0', fontSize:13, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>
            <ExternalLink size={13} /> Add to Google Calendar
          </button>
          <Link to="/book/alex" style={{ fontSize:13, color:'#606060' }}>Schedule another →</Link>
        </div>
      </div>
      <div style={{ textAlign:'center', padding:'20px 0', fontSize:12, color:'#505050' }}>Powered by Cal.clone</div>
    </div>
  );
}