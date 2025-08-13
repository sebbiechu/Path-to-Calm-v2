export default function PresetPickerModal({ open, presets, activeId, onSelect, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Choose a breathing preset" onClick={onClose}>
      <div className="modal-card picker" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Choose a preset</h2>
          <button className="btn close" onClick={onClose}>✕</button>
        </div>

        <ul className="picker-list">
          {presets.map(p => (
            <li key={p.id}>
              <button
                className={`picker-item ${activeId === p.id ? 'active' : ''}`}
                onClick={() => { onSelect(p); onClose(); }}
                aria-pressed={activeId === p.id}
              >
                <div className="picker-title">{p.label}</div>
                <div className="picker-meta">
                  {p.inMs/1000}s in
                  {p.holdMs ? ` • ${p.holdMs/1000}s hold` : ''}
                  {' '}• {p.exMs/1000}s out
                </div>
                {p.description && <div className="picker-desc">{p.description}</div>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
