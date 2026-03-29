import React from 'react';

const GS = {
  default:  { bg: '#252525', color: '#a0a0a0', border: '#333' },
  success:  { bg: '#1e1e1e', color: '#c8c8c8', border: '#303030' },
  danger:   { bg: '#1e1e1e', color: '#888888', border: '#303030' },
  warning:  { bg: '#1e1e1e', color: '#a0a0a0', border: '#303030' },
  info:     { bg: '#1e1e1e', color: '#c0c0c0', border: '#303030' },
  purple:   { bg: '#1e1e1e', color: '#c0c0c0', border: '#303030' },
};

export function Badge({ children, variant = 'default', dot }) {
  const v = GS[variant] || GS.default;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 9px', borderRadius: 20, fontSize: 12, fontWeight: 500, backgroundColor: v.bg, color: v.color, border: `1px solid ${v.border}` }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: v.color }} />}
      {children}
    </span>
  );
}

export function Spinner({ size = 22, color = '#606060' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.7s linear infinite' }}>
      <circle cx="12" cy="12" r="10" stroke={color} strokeOpacity="0.2" strokeWidth="3" />
      <path d="M4 12a8 8 0 018-8" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Avatar({ name, size = 36, src }) {
  const initials = name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: '#252525', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: 700, color: '#c0c0c0', flexShrink: 0, overflow: 'hidden' }}>
      {src ? <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
    </div>
  );
}

export function Toggle({ checked, onChange, disabled }) {
  return (
    <button role="switch" aria-checked={checked} disabled={disabled} onClick={() => !disabled && onChange(!checked)}
      style={{ width: 38, height: 20, borderRadius: 10, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer', flexShrink: 0, backgroundColor: checked ? '#f0f0f0' : '#2a2a2a', position: 'relative', transition: 'background-color 200ms', opacity: disabled ? 0.4 : 1 }}>
      <span style={{ position: 'absolute', top: 2, left: checked ? 20 : 2, width: 16, height: 16, borderRadius: '50%', backgroundColor: checked ? '#0a0a0a' : '#606060', transition: 'left 200ms cubic-bezier(0.34,1.56,0.64,1)', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }} />
    </button>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '72px 24px' }}>
      {Icon && (
        <div style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: '#1c1c1c', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Icon size={22} color="#404040" />
        </div>
      )}
      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e0e0e0', marginBottom: 7 }}>{title}</h3>
      <p style={{ fontSize: 13, color: '#505050', marginBottom: 22, maxWidth: 340, margin: '0 auto 22px' }}>{description}</p>
      {action}
    </div>
  );
}