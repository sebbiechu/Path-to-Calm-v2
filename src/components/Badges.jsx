import { useEffect, useState } from 'react';
import { ACHIEVEMENTS, XP_PER_SESSION } from '../utils/achievements.js';
import * as store from '../utils/storage.js';

export default function Badges() {
  const [xp, setXp] = useState(store.getNumber('xp', 0));
  const [unlocked, setUnlocked] = useState(() =>
    new Set(ACHIEVEMENTS.filter(a => xp >= a.threshold).map(a => a.id))
  );
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Award XP when a session completes
    const off = store.subscribe('session_complete', () => {
      const next = xp + XP_PER_SESSION;
      setXp(next);
      store.setNumber('xp', next);

      // Check for new unlocks
      const newly = ACHIEVEMENTS.filter(a => next >= a.threshold && !unlocked.has(a.id));
      if (newly.length) {
        const id = newly[0].id;
        setUnlocked(new Set([...Array.from(unlocked), id]));
        setToast(newly[0]);
        // Auto-hide toast
        setTimeout(() => setToast(null), 3500);
      }
    });
    return off;
  }, [xp, unlocked]);

  return (
    <section className="badges">
      <div className="badges-head">
        <h2 className="section-title">Badges</h2>
        <div className="xp">XP: <strong>{xp}</strong></div>
      </div>
      <div className="badge-grid">
        {ACHIEVEMENTS.map(a => {
          const isOn = unlocked.has(a.id);
          return (
            <div key={a.id} className={`badge ${isOn ? 'on' : 'off'}`} title={a.title}>
              <img src={a.img} alt="" className="badge-img" />
              <div className="badge-title">{a.title}</div>
              <div className="badge-sub">{isOn ? 'Unlocked' : `${a.threshold} XP`}</div>
            </div>
          );
        })}
      </div>

      {toast && (
        <div className="badge-toast" role="status" aria-live="polite">
          <img src={toast.img} alt="" />
          <div>
            <div className="t-title">Badge unlocked</div>
            <div className="t-body">{toast.title}</div>
          </div>
        </div>
      )}
    </section>
  );
}
