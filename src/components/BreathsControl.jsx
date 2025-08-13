export default function BreathsControl({ value, onChange, min = 5, max = 60 }) {
  const clamp = n => Math.min(max, Math.max(min, n));

  return (
    <section className="breaths">
      <h2 className="section-title">Breaths per session</h2>
      <div className="breaths-box" role="group" aria-label="Breaths per session">
        <button
          className="btn ghost"
          onClick={() => onChange(clamp(value - 1))}
          aria-label="Decrease breaths"
        >–</button>

        <input
          className="breaths-input"
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(clamp(parseInt(e.target.value || 0, 10)))}
          aria-label="Breaths count"
        />

        <button
          className="btn ghost"
          onClick={() => onChange(clamp(value + 1))}
          aria-label="Increase breaths"
        >+</button>
      </div>
      <p className="breaths-hint">Choose between {min} and {max} breaths.</p>
    </section>
  );
}
