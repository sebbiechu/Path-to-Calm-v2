import Modal from './Modal.jsx';
import RhythmBar from './RhythmBar.jsx';

export default function PresetPicker({ presets, activeId, onSelect, onClose }) {
  return (
    <Modal title="Choose an exercise" onClose={onClose} className="picker">
      <ul className="picker-list">
        {presets.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className={`picker-item${p.id === activeId ? ' active' : ''}`}
              aria-pressed={p.id === activeId}
              onClick={() => onSelect(p)}
            >
              <span className="picker-title">{p.label}</span>
              <RhythmBar inhale={p.inhale} hold={p.hold} exhale={p.exhale} />
              <span className="picker-desc">{p.description}</span>
            </button>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
