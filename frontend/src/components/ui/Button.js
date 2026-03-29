import React from 'react';

const V = {
  primary:   { bg: '#f0f0f0', color: '#0a0a0a', border: 'none',    hover: '#ffffff' },
  secondary: { bg: 'transparent', color: '#a0a0a0', border: '#2a2a2a', hover: '#1c1c1c' },
  danger:    { bg: '#1c1c1c',  color: '#909090', border: '#303030', hover: '#252525' },
  ghost:     { bg: 'transparent', color: '#606060', border: 'none', hover: '#1a1a1a' },
};
const Sz = {
  xs: { padding: '5px 10px', fontSize: 12, radius: 6 },
  sm: { padding: '7px 13px', fontSize: 13, radius: 7 },
  md: { padding: '9px 18px', fontSize: 14, radius: 8 },
  lg: { padding: '12px 24px', fontSize: 15, radius: 9 },
};

export default function Button({ children, variant = 'primary', size = 'md', loading, disabled, onClick, type = 'button', style, ...props }) {
  const v = V[variant] || V.primary;
  const s = Sz[size] || Sz.md;
  return (
    <button type={type} disabled={disabled || loading} onClick={onClick}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: s.padding, borderRadius: s.radius, fontSize: s.fontSize, fontWeight: 600, fontFamily: 'inherit', backgroundColor: v.bg, color: v.color, border: v.border ? `1px solid ${v.border}` : 'none', cursor: disabled || loading ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1, transition: 'all 150ms', ...style }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.backgroundColor = v.hover; }}
      onMouseLeave={e => { if (!disabled && !loading) e.currentTarget.style.backgroundColor = v.bg; }}
      {...props}
    >
      {loading && (
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.7s linear infinite' }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
          <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  );
}