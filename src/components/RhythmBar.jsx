// One breath cycle drawn to scale, in the same colours the session uses.
export default function RhythmBar({ inhale, hold, exhale }) {
  const parts = [
    { key: 'inhale', label: 'In', s: inhale },
    { key: 'hold', label: 'Hold', s: hold },
    { key: 'exhale', label: 'Out', s: exhale },
  ].filter((p) => p.s > 0);
  const total = parts.reduce((sum, p) => sum + p.s, 0) || 1;
  const text = parts.map((p) => `${p.label} ${p.s} seconds`).join(', ');

  return (
    <div className="rhythm" role="img" aria-label={`One breath: ${text}`}>
      {parts.map((p) => (
        <div key={p.key} className={`rhythm-seg ${p.key}`} style={{ flexGrow: p.s / total }}>
          <span>
            {p.label} {p.s}s
          </span>
        </div>
      ))}
    </div>
  );
}
