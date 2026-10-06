import { useEffect } from 'react';
import MoodPicker from './MoodPicker.jsx';

// Shown before a session when the mood check is on
export default function MoodScreen({ label, onPick, onSkip, onCancel }) {
  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.querySelector('.mood-option')?.focus();
    const onKey = (e) => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [onCancel]);

  return (
    <div className="session phase-ready" role="dialog" aria-modal="true" aria-label="Mood check">
      <div className="session-glow" aria-hidden="true" />
      <div className="session-top">
        <span className="session-name">{label}</span>
      </div>
      <div className="session-stage">
        <MoodPicker question="How are you feeling right now?" onPick={onPick} onSkip={onSkip} />
      </div>
      <div className="session-controls">
        <button type="button" className="btn quiet" onClick={onCancel}>
          Back
        </button>
      </div>
    </div>
  );
}
