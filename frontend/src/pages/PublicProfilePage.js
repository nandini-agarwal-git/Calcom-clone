import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, Video, Phone, MapPin, Globe, ArrowRight, Zap } from 'lucide-react';
import { getPublicProfile } from '../utils/api';
import { getDuration } from '../utils/helpers';
import { Spinner } from '../components/ui/Badge';

export default function PublicProfilePage() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.body.style.backgroundColor = '#0a0a0a';
    getPublicProfile(username).then(setData).catch(e => setError(e.message)).finally(() => setLoading(false));
    return () => { document.body.style.backgroundColor = ''; };
  }, [username]);

  if (loading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#0a0a0a' }}><Spinner size={30} /></div>;
  if (error || !data) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'#0a0a0a' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:14 }}>🔍</div>
        <h2 style={{ color:'#c0c0c0', fontSize:18, marginBottom:7 }}>Page not found</h2>
        <p style={{ color:'#404040', fontSize:13 }}>@{username} doesn't exist or has no active events.</p>
        <Link to="/" style={{ display:'inline-block', marginTop:18, fontSize:13, color:'#707070' }}>← Go home</Link>
      </div>
    </div>
  );

  const { user, eventTypes } = data;
  const locIcon = { video: Video, phone: Phone, default: MapPin };

  return (
    <div style={{ minHeight:'100vh', backgroundColor:'#0a0a0a' }}>
      <nav style={{ padding:'14px 22px', borderBottom:'1px solid #1a1a1a', display:'flex', alignItems:'center' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:25, height:25, borderRadius:7, backgroundColor:'#e0e0e0', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Zap size={12} color="#0a0a0a" fill="#0a0a0a" />
          </div>
          <span style={{ fontSize:14, fontWeight:700, color:'#d0d0d0' }}>Cal.clone</span>
        </Link>
      </nav>

      <div style={{ maxWidth:480, margin:'0 auto', padding:'44px 22px' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:15, marginBottom:36 }}>
          <div style={{ width:52, height:52, borderRadius:'50%', backgroundColor:'#1e1e1e', border:'1px solid #2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:700, color:'#808080', flexShrink:0 }}>
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize:20, fontWeight:700, color:'#e8e8e8', letterSpacing:'-0.4px', marginBottom:5 }}>{user.name}</h1>
            {user.bio && <p style={{ fontSize:13, color:'#606060', lineHeight:1.6, marginBottom:7 }}>{user.bio}</p>}
            {user.timezone && <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#404040' }}><Globe size={12} />{user.timezone}</div>}
          </div>
        </div>

        <p style={{ fontSize:11, fontWeight:600, color:'#383838', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:11 }}>Select an event type</p>
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          {eventTypes.map(et => {
            const LocIcon = locIcon[et.location_type] || locIcon.default;
            return (
              <Link key={et.id} to={`/book/${username}/${et.slug}`}
                style={{ display:'flex', backgroundColor:'#111', border:'1px solid #1f1f1f', borderRadius:10, overflow:'hidden', textDecoration:'none', transition:'all 150ms' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#2a2a2a'; e.currentTarget.style.backgroundColor='#161616'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#1f1f1f'; e.currentTarget.style.backgroundColor='#111'; }}
              >
                <div style={{ width:3, flexShrink:0, backgroundColor: et.color && et.color !== '#ffffff' ? '#383838' : '#252525' }} />
                <div style={{ flex:1, padding:'15px 17px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:11 }}>
                  <div>
                    <h3 style={{ fontSize:14, fontWeight:600, color:'#d8d8d8', marginBottom:5 }}>{et.title}</h3>
                    {et.description && <p style={{ fontSize:12, color:'#404040', lineHeight:1.5, marginBottom:9, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{et.description}</p>}
                    <div style={{ display:'flex', gap:13 }}>
                      <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:12, color:'#505050' }}><Clock size={11} />{getDuration(et.duration)}</span>
                      {et.location_type && <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:12, color:'#505050' }}><LocIcon size={11} />{et.location_type === 'video' ? 'Video' : et.location_type === 'phone' ? 'Phone' : 'In person'}</span>}
                    </div>
                  </div>
                  <ArrowRight size={15} color="#2a2a2a" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <div style={{ textAlign:'center', padding:'28px 0', fontSize:12, color:'#1f1f1f' }}>Powered by Cal.clone</div>
    </div>
  );
}