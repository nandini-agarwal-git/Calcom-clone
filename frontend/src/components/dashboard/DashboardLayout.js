
import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Calendar, Grid3X3, Clock, Settings, ExternalLink, Menu, X, Zap, ChevronDown, Copy } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const navItems = [
  { to: '/dashboard/event-types', icon: Grid3X3, label: 'Event types' },
  { to: '/dashboard/bookings',    icon: Calendar, label: 'Bookings' },
  { to: '/dashboard/availability',icon: Clock,    label: 'Availability' },
  { to: '/dashboard/settings',    icon: Settings, label: 'Settings' },
];

/* strict grayscale tokens for dark sidebar */
const D = {
  bg:      '#0a0a0a',
  surf:    '#141414',
  surf2:   '#1c1c1c',
  border:  '#252525',
  border2: '#303030',
  text:    '#f0f0f0',
  text2:   '#a0a0a0',
  text3:   '#606060',
  text4:   '#3a3a3a',
};

export default function DashboardLayout() {
  const { user } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const BASE = process.env.REACT_APP_BASE_URL || window.location.origin;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: D.bg }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, flexShrink: 0,
        backgroundColor: D.surf,
        borderRight: `1px solid ${D.border}`,
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40,
        transition: 'transform 250ms',
        transform: mobileOpen ? 'translateX(0)' : undefined,
      }}>
        {/* Logo */}
        <div style={{ padding: '18px 16px 14px', borderBottom: `1px solid ${D.border}` }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
            <div style={{ width: 27, height: 27, borderRadius: 7, backgroundColor: D.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={13} color={D.surf} fill={D.surf} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: D.text, letterSpacing: '-0.3px' }}>Cal.clone</span>
          </Link>
        </div>

        {/* User row */}
        {user && (
          <button style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 14px', width: '100%', border: 'none', background: 'none', cursor: 'pointer', borderBottom: `1px solid ${D.border}` }}>
            <div style={{ width: 27, height: 27, borderRadius: '50%', backgroundColor: D.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: D.surf, flexShrink: 0 }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: D.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ fontSize: 11, color: D.text3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            </div>
            <ChevronDown size={13} color={D.text3} />
          </button>
        )}

        {/* Nav */}
        <nav style={{ padding: '8px 8px', flex: 1 }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 10px', borderRadius: 6, marginBottom: 2,
                fontSize: 13, fontWeight: 500, textDecoration: 'none',
                color: isActive ? D.text : D.text3,
                backgroundColor: isActive ? D.surf2 : 'transparent',
                transition: 'all 150ms',
              })}
            >
              <Icon size={15} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '8px 8px 14px', borderTop: `1px solid ${D.border}`, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[
            { icon: ExternalLink, label: 'View public page',       onClick: () => window.open(`${BASE}/book/alex`, '_blank') },
            { icon: Copy,         label: 'Copy public page link',  onClick: () => { navigator.clipboard.writeText(`${BASE}/book/alex`); } },
          ].map(({ icon: Icon, label, onClick }) => (
            <button key={label} onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 6, border: 'none', background: 'none', cursor: 'pointer', color: D.text3, fontSize: 12, fontWeight: 400, width: '100%', textAlign: 'left', fontFamily: 'inherit', transition: 'color 150ms' }}
              onMouseEnter={e => e.currentTarget.style.color = D.text2}
              onMouseLeave={e => e.currentTarget.style.color = D.text3}
            >
              <Icon size={13} />{label}
            </button>
          ))}
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 35, backgroundColor: 'rgba(0,0,0,0.7)' }} onClick={() => setMobileOpen(false)} />}

      {/* ── Main ── */}
      <div style={{ flex: 1, marginLeft: 220, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Mobile header */}
        <header style={{ display: 'none', alignItems: 'center', gap: 12, padding: '12px 16px', backgroundColor: D.surf, borderBottom: `1px solid ${D.border}`, position: 'sticky', top: 0, zIndex: 20 }}>
          <button style={{ color: D.text2, cursor: 'pointer', display: 'flex', border: 'none', background: 'none' }} onClick={() => setMobileOpen(true)}>
            <Menu size={20} />
          </button>
          <span style={{ fontSize: 15, fontWeight: 700, color: D.text }}>Cal.clone</span>
          {user && <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: D.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: D.surf, marginLeft: 'auto' }}>{user.name?.[0]?.toUpperCase()}</div>}
        </header>

        <main style={{ padding: '36px 40px', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
