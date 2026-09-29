import { MOODS } from '../data/mood.js';

export default function MoodPicker({ question, onPick, onSkip }) {
  return (
    <fieldset className="mood">
      <legend className="mood-question">{question}</legend>
      <div className="mood-options">
        {MOODS.map((m) => (
          <button key={m.value} type="button" className={`mood-option m${m.value}`} onClick={() => onPick(m.value)}>
            <span className="mood-num" aria-hidden="true">{m.value}</span>
            <span className="mood-label">{m.label}</span>
          </button>
        ))}
      </div>
      {onSkip && (
        <button type="button" className="link-btn subtle" onClick={onSkip}>
          Skip
        </button>
      )}
    </fieldset>
  );
}
