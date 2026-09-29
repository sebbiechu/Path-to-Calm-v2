// Badge artwork, or a simple placeholder emblem until illustrations exist
const EMBLEMS = {
  // five points: the five exercises
  explorer: (
    <g fill="var(--sky)">
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx={50 + 22 * Math.sin((a * Math.PI) / 180)} cy={50 - 22 * Math.cos((a * Math.PI) / 180)} r="7" />
      ))}
    </g>
  ),
  // three days rising
  week3: (
    <g fill="var(--amber)">
      <rect x="27" y="52" width="12" height="20" rx="4" />
      <rect x="44" y="42" width="12" height="30" rx="4" />
      <rect x="61" y="30" width="12" height="42" rx="4" />
    </g>
  ),
  // ripples: rounds
  rounds: (
    <g fill="none" stroke="var(--sky)" strokeWidth="4">
      <circle cx="50" cy="50" r="8" />
      <circle cx="50" cy="50" r="17" opacity="0.7" />
      <circle cx="50" cy="50" r="26" opacity="0.4" />
    </g>
  ),
  // a full circle of time
  hour: (
    <g fill="none" stroke="var(--sage)" strokeWidth="5" strokeLinecap="round">
      <circle cx="50" cy="50" r="24" opacity="0.35" />
      <path d="M50 26 A24 24 0 1 1 26 50" />
      <path d="M50 38 V50 L58 56" strokeWidth="4" />
    </g>
  ),
  // four waves: four weeks
  rhythm4: (
    <g fill="none" stroke="var(--rose)" strokeWidth="4" strokeLinecap="round">
      {[32, 44, 56, 68].map((y) => (
        <path key={y} d={`M26 ${y} q6 -6 12 0 t12 0 t12 0 t12 0`} />
      ))}
    </g>
  ),
};

export default function BadgeArt({ badge, size = 72 }) {
  if (badge.img) return <img className="badge-art" src={badge.img} alt="" width={size} height={size} loading="lazy" />;
  return (
    <svg className="badge-art emblem" viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      <circle cx="50" cy="50" r="48" className="emblem-bg" />
      {EMBLEMS[badge.emblem]}
    </svg>
  );
}
