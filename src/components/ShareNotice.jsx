// Non-blocking notice for colleagues: sharing is on by default, with a one-tap opt-out
export default function ShareNotice({ onOk, onTurnOff }) {
  return (
    <div className="share-notice" role="region" aria-labelledby="notice-title">
      <div className="share-notice-text">
        <p id="notice-title" className="share-title">
          Anonymous mood sharing is on
        </p>
        <p className="muted">
          To help People Development see whether sessions help, your before and after mood scores, the exercise and
          session length are shared anonymously. Nothing that identifies you is sent. You can change this any time in
          Settings.
        </p>
      </div>
      <div className="share-actions">
        <button type="button" className="btn primary" onClick={onOk}>
          OK
        </button>
        <button type="button" className="btn quiet" onClick={onTurnOff}>
          Turn off
        </button>
      </div>
    </div>
  );
}
