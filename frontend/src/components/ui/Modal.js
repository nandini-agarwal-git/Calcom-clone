import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  const widths = { sm: 420, md: 540, lg: 700, xl: 860 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, animation: 'fadeIn 150ms ease-out' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: '100%', maxWidth: widths[size] || widths.md, maxHeight: '90vh', backgroundColor: '#161616', border: '1px solid #2a2a2a', borderRadius: 14, boxShadow: '0 30px 60px rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', animation: 'slideUp 200ms ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '17px 22px', borderBottom: '1px solid #1f1f1f' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#e0e0e0' }}>{title}</h2>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #2a2a2a', backgroundColor: '#1c1c1c', color: '#606060', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={15} />
          </button>
        </div>
        <div style={{ padding: 22, overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}