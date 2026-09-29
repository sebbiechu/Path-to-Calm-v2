import Modal from './Modal.jsx';
import RhythmBar from './RhythmBar.jsx';
import Tip from './Tip.jsx';

export default function PresetPicker({ presets, activeId, onSelect, onClose }) {
  return (
    <Modal title="Choose an exercise" onClose={onClose} className="picker">
      <Tip id="picker">
        Not sure where to start? Try Extended exhale when you feel stressed, Coherent to focus, or 4&#8209;7&#8209;8 before bed.
      </Tip>
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
