import { useState } from 'react';
import Modal from './Modal.jsx';
import { ACHIEVEMENTS } from '../data/achievements.js';

export default function ProgressPanel({ stats, xp }) {
  const [open, setOpen] = useState(null);
  const next = ACHIEVEMENTS.find((a) => xp < a.threshold);
  const prevThreshold = next ? ACHIEVEMENTS[ACHIEVEMENTS.indexOf(next) - 1]?.threshold ?? 0 : 0;
  const pct = next ? ((xp - prevThreshold) / (next.threshold - prevThreshold)) * 100 : 100;

  return (
    <section className="progress" aria-labelledby="progress-title">
      <h2 id="progress-title">Your progress</h2>

      <dl className="stats">
        <div>
          <dt>Minutes</dt>
          <dd>{Math.floor(stats.totalSeconds / 60)}</dd>
        </div>
        <div>
          <dt>Day streak</dt>
          <dd>{stats.currentStreak}</dd>
        </div>
        <div>
          <dt>Sessions</dt>
          <dd>{stats.sessions}</dd>
        </div>
      </dl>

      <div className="xp">
        <div className="xp-row">
          <span>{xp} XP</span>
          <span>{next ? `${next.threshold - xp} XP to ${next.title}` : 'All badges unlocked'}</span>
        </div>
        <div className="xp-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label="Progress to next badge">
          <div className="xp-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <ul className="badges">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = xp >= a.threshold;
          return (
            <li key={a.id}>
              <button
                type="button"
                className={`badge${unlocked ? ' unlocked' : ''}`}
                onClick={() => unlocked && setOpen(a)}
                disabled={!unlocked}
              >
                <img src={a.img} alt="" width="96" height="96" loading="lazy" />
                <span className="badge-title">{a.title}</span>
                <span className="badge-sub">{unlocked ? 'Unlocked' : `${a.threshold} XP`}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {open && (
        <Modal title={open.title} onClose={() => setOpen(null)} className="badge-modal">
          <img src={open.img} alt="" width="200" height="200" />
          <p>{open.description}</p>
        </Modal>
      )}
    </section>
  );
}
