export default function PresetPickerModal({ open, presets, activeId, onSelect, onClose }) {
  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Choose a breathing preset"
      onClick={onClose}
    >
      <div className="modal-card picker" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Choose a preset</h2>
          <button className="btn close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <ul className="picker-list">
          {presets.map((p) => (
            <li key={p.id} className="picker-cell">
              <button
                type="button"
                className={`picker-item ${activeId === p.id ? 'active' : ''}`}
                onClick={() => { onSelect(p); onClose(); }}
                aria-pressed={activeId === p.id}
              >
                <div className="picker-head">
                  <div className="picker-title">{p.label}</div>
                  <svg className="picker-caret" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                <div className="picker-chips">
                  <span className="chip">{p.inMs/1000}s in</span>
                  {p.holdMs ? <span className="chip">{p.holdMs/1000}s hold</span> : null}
                  <span className="chip">{p.exMs/1000}s out</span>
                </div>

                {p.description && <p className="picker-desc">{p.description}</p>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
