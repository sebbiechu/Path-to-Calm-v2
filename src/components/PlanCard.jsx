import RhythmBar from './RhythmBar.jsx';
import { aboutMinutes, plural } from '../lib/format.js';

export default function PlanCard({ label, customised, settings, durationMs, onChange }) {
  const { breaths, rounds } = settings;
  return (
    <section className="plan" aria-label="Your breathing exercise">
      <div className="plan-head">
        <h2 className="plan-name">
          {label}
          {customised && <span className="plan-tag">Customised</span>}
        </h2>
        <button type="button" className="link-btn" onClick={onChange}>
          Change exercise
        </button>
      </div>
      <RhythmBar inhale={settings.inhale} hold={settings.hold} exhale={settings.exhale} />
      <p className="plan-meta">
        {plural(breaths, 'breath')}
        {rounds > 1 ? ` in each of ${rounds} rounds` : ''}, {aboutMinutes(durationMs)}
      </p>
    </section>
  );
}
