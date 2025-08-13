export default function SessionSummary({ summary, onOpenPicker }) {
  const { breaths, retention, rounds, label } = summary;
  return (
    <div className="summary-wrap">
      <button className="summary-pill" onClick={onOpenPicker} aria-label="Open preset and session options">
        <span className="summary-chip">
          <span className="i i-breaths" aria-hidden="true">🫁</span>
          {breaths} breaths
        </span>
        <span className="summary-dot" aria-hidden="true">•</span>
        <span className="summary-chip">
          <span className="i i-timer" aria-hidden="true">⏱</span>
          {retention}s hold
        </span>
        <span className="summary-dot" aria-hidden="true">•</span>
        <span className="summary-chip">
          <span className="i i-rounds" aria-hidden="true">↻</span>
          {rounds} rounds
        </span>
      </button>
      <div className="summary-sub">Preset: <strong>{label}</strong></div>
    </div>
  );
}
