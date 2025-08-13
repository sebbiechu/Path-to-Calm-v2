import { useEffect, useState } from 'react';
import * as store from '../utils/storage.js';

export default function StatsPanel() {
  const [minutes, setMinutes] = useState(store.getNumber('stats_minutes', 0));
  const [streak, setStreak] = useState(store.getNumber('stats_streak', 0));
  const [lastDay, setLastDay] = useState(store.get('stats_last_day', ''));

  useEffect(() => {
    const unsub = store.subscribe('session_complete', (payload) => {
      setMinutes(prev => {
        const next = prev + payload.durationMin;
        store.setNumber('stats_minutes', next);
        return next;
      });
      const today = new Date().toISOString().slice(0,10);
      if (lastDay === today) return;
      if (!lastDay) {
        setStreak(1); store.setNumber('stats_streak', 1);
      } else {
        const prev = new Date(lastDay);
        const diff = Math.round((new Date(today) - prev)/(1000*60*60*24));
        const next = diff === 1 ? streak + 1 : diff > 1 ? 1 : streak;
        setStreak(next); store.setNumber('stats_streak', next);
      }
      setLastDay(today); store.set('stats_last_day', today);
    });
    return unsub;
  }, [lastDay, streak]);

  return (
    <section className="stats">
      <div className="stat">
        <div className="stat-value">{minutes}</div>
        <div className="stat-label">Total minutes</div>
      </div>
      <div className="stat">
        <div className="stat-value">{streak}</div>
        <div className="stat-label">Day streak</div>
      </div>
      <div className="stat note">
        Tap a preset and press <strong>Begin</strong> to start.
      </div>
    </section>
  );
}
