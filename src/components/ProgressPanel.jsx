import { BADGES } from '../data/badges.js';
import { findPreset } from '../data/presets.js';
import { moodSummary } from '../lib/stats.js';
import BadgeArt from './BadgeArt.jsx';

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
      <div className="panel-section">
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

  return (
    <div className="panel-section" role="img" aria-label={`${headline} Based on ${count} sessions.`}>
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

export default function ProgressPanel({ stats, weekDays, moods, earned, status, onOpenBadge }) {
  const earnedCount = BADGES.filter((b) => earned[b.id]).length;

  return (
    <section className="progress" aria-labelledby="progress-title">
      <h2 id="progress-title">Your progress</h2>

      <dl className="stats">
        <div>
          <dt>Minutes</dt>
          <dd>{Math.floor(stats.totalSeconds / 60)}</dd>
        </div>
        <div>
          <dt>Days this week</dt>
          <dd>{weekDays}</dd>
        </div>
        <div>
          <dt>Sessions</dt>
          <dd>{stats.sessions}</dd>
        </div>
      </dl>

      {moods && <MoodSection moods={moods} />}

      <div className="panel-section">
        <div className="badges-head">
          <h3>Badges</h3>
          <span className="muted">
            {earnedCount} of {BADGES.length}
          </span>
        </div>
        <ul className="badges">
          {BADGES.map((b) => {
            const got = Boolean(earned[b.id]);
            const p = status[b.id]?.progress;
            return (
              <li key={b.id}>
                <button
                  type="button"
                  className={`badge${got ? ' unlocked' : ''}`}
                  onClick={() => onOpenBadge(b.id)}
                  aria-label={`${b.title}: ${got ? 'earned' : b.goal}`}
                >
                  <BadgeArt badge={b} size={56} />
                  <span className="badge-title">{b.title}</span>
                  <span className="badge-sub">{got ? 'Earned' : p ? `${p[0]} of ${p[1]}` : 'Locked'}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
