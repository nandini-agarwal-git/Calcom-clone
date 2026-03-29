import React from 'react';

const base = {
  width: '100%', padding: '9px 13px',
  backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a',
  borderRadius: 8, color: '#e8e8e8', fontSize: 14, fontFamily: 'inherit',
  transition: 'border-color 150ms', outline: 'none',
};

export function Input({ label, error, hint, style, ...props }) {
  return (
    <div>
      {label && <label style={L.label}>{label}</label>}
      <input style={{ ...base, ...(error ? { borderColor: '#404040' } : {}), ...style }}
        onFocus={e => { e.target.style.borderColor = '#606060'; }}
        onBlur={e => { e.target.style.borderColor = error ? '#404040' : '#2a2a2a'; }}
        {...props} />
      {error && <p style={L.error}>{error}</p>}
      {hint && !error && <p style={L.hint}>{hint}</p>}
    </div>
  );
}

export function Textarea({ label, error, hint, rows = 3, style, ...props }) {
  return (
    <div>
      {label && <label style={L.label}>{label}</label>}
      <textarea rows={rows} style={{ ...base, resize: 'none', ...(error ? { borderColor: '#404040' } : {}), ...style }}
        onFocus={e => { e.target.style.borderColor = '#606060'; }}
        onBlur={e => { e.target.style.borderColor = error ? '#404040' : '#2a2a2a'; }}
        {...props} />
      {error && <p style={L.error}>{error}</p>}
      {hint && !error && <p style={L.hint}>{hint}</p>}
    </div>
  );
}

export function Select({ label, error, hint, children, style, ...props }) {
  return (
    <div>
      {label && <label style={L.label}>{label}</label>}
      <select style={{ ...base, cursor: 'pointer', ...(error ? { borderColor: '#404040' } : {}), ...style }}
        onFocus={e => { e.target.style.borderColor = '#606060'; }}
        onBlur={e => { e.target.style.borderColor = error ? '#404040' : '#2a2a2a'; }}
        {...props}>
        {children}
      </select>
      {error && <p style={L.error}>{error}</p>}
      {hint && !error && <p style={L.hint}>{hint}</p>}
    </div>
  );
}

const L = {
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#909090', marginBottom: 6 },
  error: { fontSize: 12, color: '#909090', marginTop: 5 },
  hint:  { fontSize: 12, color: '#505050', marginTop: 5 },
};