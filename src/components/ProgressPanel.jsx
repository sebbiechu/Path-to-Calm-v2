import { useState } from 'react';
import Modal from './Modal.jsx';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { findPreset } from '../data/presets.js';
import { moodSummary } from '../lib/stats.js';

// Each recent session as a line from "before" to "after" on a 1 to 5 scale
function MoodChart({ entries }) {
  const recent = entries.slice(-12);
  const W = 300;
  const H = 110;
  const pad = 12;
  const y = (v) => H - pad - ((v - 1) / 4) * (H - pad * 2);
  const step = recent.length > 1 ? (W - pad * 2) / (recent.length - 1) : 0;
  const x = (i) => (recent.length > 1 ? pad + i * step : W / 2);

  return (
    <svg className="mood-chart" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      {[1, 3, 5].map((v) => (
        <line key={v} className="grid" x1="0" x2={W} y1={y(v)} y2={y(v)} />
      ))}
      {recent.map((e, i) => (
        <g key={i} className={e.after > e.before ? 'up' : e.after < e.before ? 'down' : 'same'}>
          <line className="stem" x1={x(i)} x2={x(i)} y1={y(e.before)} y2={y(e.after)} />
          <circle className="before" cx={x(i)} cy={y(e.before)} r="4" />
          <circle className="after" cx={x(i)} cy={y(e.after)} r="4.5" />
        </g>
      ))}
    </svg>
  );
}

function MoodSection({ moods }) {
  const summary = moodSummary(moods);
  if (!summary) {
    return (
      <div className="mood-panel">
        <h3>How you feel</h3>
        <p className="muted">Rate how you feel before and after a session to see what helps you most.</p>
      </div>
    );
  }
  const { change, count, best } = summary;
  const headline =
    change > 0
      ? `On average you feel ${change} ${change === 1 ? 'point' : 'points'} calmer after a session.`
      : change === 0
        ? 'On average your mood stays about the same after a session.'
        : 'On average you feel slightly less calm after a session. Try a longer exhale.';
  const text = `${headline} Based on ${count} ${count === 1 ? 'session' : 'sessions'}.`;

  return (
    <div className="mood-panel" role="img" aria-label={text}>
      <h3>How you feel</h3>
      <p>{headline}</p>
      <MoodChart entries={moods} />
      <p className="mood-legend">
        <span className="key before" /> Before <span className="key after" /> After
        <span className="muted">Last {Math.min(12, count)} sessions</span>
      </p>
      {best && (
        <p className="muted">
          {findPreset(best.preset).label} helps you most (+{best.change}).
        </p>
      )}
    </div>
  );
}

export default function ProgressPanel({ stats, xp, moods }) {
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

      {moods && <MoodSection moods={moods} />}

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
