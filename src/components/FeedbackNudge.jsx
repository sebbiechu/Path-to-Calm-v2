import { FEEDBACK_URL } from '../data/links.js';

// One-time invitation to the feedback form, after a few completed sessions
export default function FeedbackNudge({ onDone }) {
  return (
    <section className="nudge" aria-labelledby="nudge-title">
      <div>
        <p id="nudge-title" className="nudge-title">
          Enjoying Path to Calm?
        </p>
        <p className="muted">Tell us what you think. It takes about a minute and it’s anonymous.</p>
      </div>
      <div className="nudge-actions">
        <a className="btn primary" href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer" onClick={onDone}>
          Give feedback
        </a>
        <button type="button" className="btn quiet" onClick={onDone}>
          Not now
        </button>
      </div>
    </section>
  );
}
