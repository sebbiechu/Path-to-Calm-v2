import { useState, useEffect } from 'react';

export default function DisclaimerModal({ open, mode = 'block', onAccept, onClose }) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) setClosing(false);
  }, [open]);

  // Don't render at all if not open and not in closing animation
  if (!open && !closing) return null;

  const blocking = mode === 'block';
  const closeWithAnimation = (action) => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      action && action();
    }, 260); // match CSS animation duration
  };

  return (
    <div
      className="modal-overlay disclaimer-overlay"
      onClick={() => {
        if (!blocking) closeWithAnimation(onClose);
      }}
      role="presentation"
    >
      <div
        className={`bottom-sheet ${closing ? 'closing' : 'open'}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="disc-title"
      >
        <div className="sheet-grabber" aria-hidden="true" />
        <div className="sheet-header">
          <h2 id="disc-title">Medical Disclaimer</h2>
          {!blocking && (
            <button
              className="btn close"
              onClick={() => closeWithAnimation(onClose)}
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>

        <div className="sheet-body">
          <p>
            This app is not a substitute for medical advice. Always consult a healthcare
            provider before starting any breathing exercises, especially if you have
            respiratory or cardiovascular conditions, or if you are pregnant.
          </p>
          <p>
            Stop immediately if you feel dizzy, faint, or unwell during any session.
            Use this app in a safe environment where you can sit or lie down if needed.
          </p>
        </div>

        <div className="sheet-footer">
          <button
            className="btn primary"
            onClick={() => closeWithAnimation(onAccept)}
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
