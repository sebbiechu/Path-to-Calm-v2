export default function PresetsBar({ presets, activeId, onSelect }) {
  return (
    <section className="presets">
      <h2 className="section-title">Choose a preset</h2>
      <div className="row-scroll" aria-label="Presets">
        {presets.map(p => (
          <button
            key={p.id}
            className={`pill ${activeId === p.id ? 'active' : ''}`}
            onClick={() => onSelect(p)}
            aria-pressed={activeId === p.id}
            title={`${p.label}: ${p.description}`}
          >
            <span className="pill-title">{p.label}</span>
            <span className="pill-sub">{p.inMs/1000}s / {p.exMs/1000}s</span>
          </button>
        ))}
      </div>
    </section>
  );
}
