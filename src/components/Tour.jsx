import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

// Onboarding tour: dims and blurs the page except one highlighted element, with a card beside it.
// Steps point at elements marked with data-tour="...".
const STEPS = [
  {
    target: 'plan',
    title: 'Choose your exercise',
    body: 'Tap “Change exercise” to pick one. The bar shows a single breath: blue is in, amber is hold, pink is out.',
  },
  {
    target: 'start',
    title: 'Follow the circle',
    body: 'Press Start session, then breathe with the circle. It grows as you breathe in and shrinks as you breathe out. You can pause at any time.',
  },
  {
    target: 'settings',
    title: 'Make it yours',
    body: 'Change timings and rounds, and switch to dark mode. On a phone, you can also turn on vibration to breathe silently with the sound off.',
  },
  {
    target: 'progress',
    title: 'See your progress',
    body: 'Track your minutes and how you feel after each session. Badges unlock short cards about why breathing works.',
  },
];

const PAD = 8; // space around the highlighted element
const GAP = 14; // space between highlight and card

function holePath(r, w, h) {
  const x = r.left - PAD;
  const y = r.top - PAD;
  const rw = r.width + PAD * 2;
  const rh = r.height + PAD * 2;
  const k = Math.min(18, rw / 2, rh / 2);
  // Outer rectangle, then a rounded-rectangle hole (evenodd leaves the hole clear)
  return `M0 0H${w}V${h}H0Z M${x + k} ${y}H${x + rw - k}A${k} ${k} 0 0 1 ${x + rw} ${y + k}V${y + rh - k}A${k} ${k} 0 0 1 ${x + rw - k} ${y + rh}H${x + k}A${k} ${k} 0 0 1 ${x} ${y + rh - k}V${y + k}A${k} ${k} 0 0 1 ${x + k} ${y}Z`;
}

export default function Tour({ onClose }) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const [cardPos, setCardPos] = useState({ top: 0, left: 0 });
  const cardRef = useRef(null);
  const nextRef = useRef(null);
  const step = STEPS[index];
  const last = index === STEPS.length - 1;

  const finish = useCallback(() => onClose(), [onClose]);
  const next = useCallback(() => (last ? finish() : setIndex((i) => i + 1)), [last, finish]);
  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  // Scroll the target into view on each step
  useEffect(() => {
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    nextRef.current?.focus({ preventScroll: true });
  }, [step.target]);

  // Track the target's position (it moves while scrolling or resizing)
  useEffect(() => {
    let raf;
    const measure = () => {
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect((prev) =>
          prev && prev.top === r.top && prev.left === r.left && prev.width === r.width && prev.height === r.height
            ? prev
            : { top: r.top, left: r.left, width: r.width, height: r.height }
        );
      }
      raf = requestAnimationFrame(measure);
    };
    measure();
    return () => cancelAnimationFrame(raf);
  }, [step.target]);

  // Place the card below the highlight if it fits, otherwise above, otherwise overlapping the bottom
  useLayoutEffect(() => {
    if (!rect || !cardRef.current) return;
    const card = cardRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const below = rect.top + rect.height + PAD + GAP;
    const above = rect.top - PAD - GAP - card.height;
    let top;
    if (below + card.height <= vh - 12) top = below;
    else if (above >= 12) top = above;
    else top = Math.max(12, vh - card.height - 12);
    const left = Math.min(Math.max(12, rect.left), vw - card.width - 12);
    setCardPos({ top, left });
  }, [rect, index]);

  // Keyboard: Esc skips, arrows move, Tab stays inside the card
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') finish();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') back();
      if (e.key === 'Tab' && cardRef.current) {
        const items = [...cardRef.current.querySelectorAll('button')];
        const i = items.indexOf(document.activeElement);
        e.preventDefault();
        items[(i + (e.shiftKey ? -1 : 1) + items.length) % items.length].focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [finish, next, back]);

  const w = typeof window !== 'undefined' ? window.innerWidth : 0;
  const h = typeof window !== 'undefined' ? window.innerHeight : 0;

  return (
    <div className="tour">
      <div
        className="tour-shade"
        style={rect ? { clipPath: `path(evenodd, '${holePath(rect, w, h)}')` } : undefined}
        onClick={finish}
        aria-hidden="true"
      />
      {rect && (
        <div
          className="tour-ring"
          aria-hidden="true"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
          }}
        />
      )}
      <div
        ref={cardRef}
        className="tour-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        style={{ top: cardPos.top, left: cardPos.left, visibility: rect ? 'visible' : 'hidden' }}
      >
        <p className="tour-count">
          {index + 1} of {STEPS.length}
        </p>
        <h2 id="tour-title">{step.title}</h2>
        <p id="tour-body">{step.body}</p>
        <div className="tour-actions">
          <button type="button" className="link-btn subtle" onClick={finish}>
            Skip tour
          </button>
          <span className="tour-nav">
            {index > 0 && (
              <button type="button" className="btn quiet" onClick={back}>
                Back
              </button>
            )}
            <button type="button" className="btn primary" onClick={next} ref={nextRef}>
              {last ? 'Got it' : 'Next'}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
