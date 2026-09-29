import { useEffect, useState } from 'react';
import { read, write } from '../lib/storage.js';

// A one-time hint. Shows the first time its parent opens, then never again.
export default function Tip({ id, children }) {
  const key = `ptc.tip.${id}`;
  const [visible, setVisible] = useState(() => read(key) !== '1');

  useEffect(() => {
    if (visible) write(key, '1'); // seen once is enough
  }, [key, visible]);

  if (!visible) return null;
  return (
    <div className="tip" role="note">
      <svg className="tip-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </svg>
      <p>{children}</p>
      <button type="button" className="tip-close" onClick={() => setVisible(false)} aria-label="Dismiss tip">
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
