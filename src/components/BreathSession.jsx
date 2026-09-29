import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildSteps, createEngine, totalMs } from '../lib/engine.js';
import * as audio from '../lib/audio.js';
import { read, write } from '../lib/storage.js';
import { clock, plural } from '../lib/format.js';
import BadgeArt from './BadgeArt.jsx';
import { cue, stopCues } from '../lib/cues.js';
import { moodLabel } from '../data/mood.js';
import MoodPicker from './MoodPicker.jsx';

const MIN = 0.62;
const MAX = 1;
const ease = (p) => 0.5 - 0.5 * Math.cos(Math.PI * p);

function orbScale(phase, p) {
  if (phase === 'inhale') return MIN + (MAX - MIN) * ease(p);
  if (phase === 'hold') return MAX;
  if (phase === 'exhale') return MAX - (MAX - MIN) * ease(p);
  if (phase === 'rest' || phase === 'done') return 0.78;
  return MIN;
}

const LABELS = {
  ready: ['Get ready', 'Sit comfortably and relax your shoulders'],
  inhale: ['Breathe in', null],
  hold: ['Hold', null],
  exhale: ['Breathe out', null],
  rest: ['Rest', 'Breathe normally'],
  done: ['Well done', null],
};

function useWakeLock(active) {
  useEffect(() => {
    if (!active || !('wakeLock' in navigator)) return;
    let lock = null;
    const acquire = async () => {
      try {
        lock = await navigator.wakeLock.request('screen');
      } catch {
        lock = null;
      }
    };
    const onVisible = () => document.visibilityState === 'visible' && acquire();
    acquire();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      lock?.release?.().catch(() => {});
    };
  }, [active]);
}

export default function BreathSession({ settings, label, moodBefore = null, newBadges = [], onComplete, onMood, onExit }) {
  const steps = useMemo(() => buildSteps(settings), [settings]);
  const total = useMemo(() => totalMs(steps), [steps]);

  const [step, setStep] = useState(steps[0] || null);
  const [status, setStatus] = useState('running'); // running | paused | done
  const [muted, setMuted] = useState(() => read('ptc.muted') === '1');
  const [finalSeconds, setFinalSeconds] = useState(0);
  const [moodAfter, setMoodAfter] = useState(null);

  const engineRef = useRef(null);
  const orbRef = useRef(null);
  const ringRef = useRef(null);
  const countRef = useRef(null);
  const timeRef = useRef(null);
  const pauseBtnRef = useRef(null);
  const statusRef = useRef(status);
  const callbacks = useRef({ onComplete, onExit });
  const cueRef = useRef({ vibrate: settings.vibrate });

  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  useEffect(() => {
    callbacks.current = { onComplete, onExit };
  }, [onComplete, onExit]);

  useEffect(() => {
    cueRef.current = { vibrate: settings.vibrate };
  }, [settings.vibrate]);

  useEffect(() => {
    audio.setMuted(muted);
    write('ptc.muted', muted ? '1' : '0');
  }, [muted]);

  useWakeLock(status !== 'done');

  // Engine lifecycle
  useEffect(() => {
    const engine = createEngine(steps, {
      onStep: (st) => {
        setStep(st);
        audio.playPhase(st.phase);
        cue(st.phase, cueRef.current);
      },
      onDone: () => {
        const seconds = Math.round(engine.snapshot().elapsedMs / 1000);
        audio.stopAll();
        stopCues();
        audio.playChime();
        setFinalSeconds(seconds);
        setStatus('done');
        callbacks.current.onComplete(seconds);
      },
    });
    engineRef.current = engine;
    engine.start();
    return () => {
      engine.stop();
      audio.stopAll();
      stopCues();
    };
  }, [steps]);

  // Animation loop: writes straight to the DOM so React doesn't re-render 60 times a second
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf;
    const frame = () => {
      const snap = engineRef.current?.snapshot();
      if (snap) {
        const finished = statusRef.current === 'done';
        const phase = finished ? 'done' : snap.step?.phase;
        if (orbRef.current) {
          orbRef.current.style.transform = `scale(${reduce ? 0.85 : orbScale(phase, snap.progress)})`;
        }
        if (ringRef.current) {
          ringRef.current.style.strokeDashoffset = String(finished ? 0 : 1 - snap.progress);
        }
        if (countRef.current) {
          countRef.current.textContent = finished || !snap.step ? '' : String(Math.ceil(snap.stepLeftMs / 1000));
        }
        if (timeRef.current) {
          timeRef.current.textContent = clock(total - snap.elapsedMs);
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [total]);

  const togglePause = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || statusRef.current === 'done') return;
    if (statusRef.current === 'running') {
      engine.pause();
      audio.pauseAll();
      stopCues();
      setStatus('paused');
    } else {
      engine.resume();
      audio.resumeCurrent();
      setStatus('running');
    }
  }, []);

  const restart = () => {
    audio.stopAll();
    stopCues();
    setStatus('running');
    engineRef.current?.start();
  };

  const exit = useCallback(() => {
    const engine = engineRef.current;
    const completed = statusRef.current === 'done';
    const seconds = engine ? Math.round(engine.snapshot().elapsedMs / 1000) : 0;
    engine?.stop();
    audio.stopAll();
    stopCues();
    callbacks.current.onExit({ seconds, completed });
  }, []);

  // Auto-pause if the phone locks or the tab is hidden
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden' && statusRef.current === 'running') togglePause();
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [togglePause]);

  // Keyboard: Space pauses/resumes, Esc ends
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') exit();
      if (e.key === ' ' && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
        togglePause();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [exit, togglePause]);

  useEffect(() => {
    pauseBtnRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  const done = status === 'done';
  const phase = done ? 'done' : step?.phase || 'ready';
  const [title, sub] = LABELS[phase];

  return (
    <div className={`session phase-${phase}`} role="dialog" aria-modal="true" aria-label="Breathing session">
      <div className="session-glow" aria-hidden="true" />

      <header className="session-top">
        <span className="session-name">{label}</span>
        <div className="session-top-right">
          <span className="session-clock" aria-label="Time remaining">
            <span ref={timeRef}>{clock(total)}</span> left
          </span>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setMuted((m) => !m)}
            aria-pressed={muted}
            aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 9v6h4l5 4V5L8 9H4z" />
              {muted ? <path d="M17 9l5 6M22 9l-5 6" /> : <path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12" />}
            </svg>
          </button>
        </div>
      </header>

      <main className="session-stage">
        <div className="orb-frame">
          <svg className="orb-ring" viewBox="0 0 100 100" aria-hidden="true">
            <circle className="ring-track" cx="50" cy="50" r="48" pathLength="1" />
            <circle ref={ringRef} className="ring-progress" cx="50" cy="50" r="48" pathLength="1" />
          </svg>
          <div ref={orbRef} className="orb" aria-hidden="true" />
          <div className="orb-text" aria-live="polite">
            <span className="orb-title">{title}</span>
            <span ref={countRef} className="orb-count" aria-hidden="true" />
          </div>
        </div>

        {done && moodBefore !== null && moodAfter === null ? (
          <MoodPicker
            question="How do you feel now?"
            onPick={(n) => {
              setMoodAfter(n);
              onMood?.(n, finalSeconds);
            }}
            onSkip={() => setMoodAfter(0)}
          />
        ) : (
        <p className="session-sub">
          {done
            ? `You breathed for ${finalSeconds < 60 ? plural(finalSeconds, 'second') : plural(Math.round(finalSeconds / 60), 'minute')}.`
            : sub ||
              (settings.rounds > 1
                ? `Round ${step.round} of ${settings.rounds}, breath ${step.breath} of ${settings.breaths}`
                : `Breath ${step?.breath ?? 1} of ${settings.breaths}`)}
        </p>
        )}
        {done && moodAfter > 0 && (
          <p className="session-sub mood-result">
            {moodAfter > moodBefore
              ? `You went from ${moodLabel(moodBefore).toLowerCase()} to ${moodLabel(moodAfter).toLowerCase()}.`
              : moodAfter === moodBefore
                ? `You stayed ${moodLabel(moodAfter).toLowerCase()}. Some sessions are like that.`
                : 'You feel less calm than before. Try a longer exhale, or take a break.'}
          </p>
        )}
        {status === 'paused' && <p className="session-paused">Paused</p>}
        {done && newBadges.length > 0 && !(moodBefore !== null && moodAfter === null) && (
          <div className="unlock" role="status">
            <BadgeArt badge={newBadges[0]} size={52} />
            <div>
              <p className="unlock-title">
                {newBadges.length === 1 ? 'New badge' : `${newBadges.length} new badges`}: {newBadges.map((b) => b.title).join(', ')}
              </p>
              <p className="unlock-sub">Finish to read what you unlocked</p>
            </div>
          </div>
        )}
      </main>

      <footer className="session-controls">
        {done ? (
          <button type="button" className="btn primary" onClick={exit} ref={pauseBtnRef}>
            Finish
          </button>
        ) : (
          <>
            <button type="button" className="btn quiet" onClick={restart}>
              Restart
            </button>
            <button type="button" className="btn primary" onClick={togglePause} ref={pauseBtnRef}>
              {status === 'paused' ? 'Resume' : 'Pause'}
            </button>
            <button type="button" className="btn quiet" onClick={exit}>
              End session
            </button>
          </>
        )}
      </footer>
    </div>
  );
}
