import { useEffect, useRef, useState } from 'react';
import useBreathEngine from '../hooks/useBreathEngine.js';
import { playPhaseSound, stopAllSounds } from '../utils/audio.js';
import { supabase } from '../utils/supabaseClient.js';

function formatMMSS(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getBrowserKey() {
  const KEY = 'ptc_user_key';
  let k = localStorage.getItem(KEY);
  if (!k) {
    k = (crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`); // fallback
    localStorage.setItem(KEY, k);
  }
  return k;
}

export default function BreathSession({ preset, onClose }) {
  const [phase, setPhase] = useState('inhale');
  const [remaining, setRemaining] = useState(preset.breaths);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const circleRef = useRef(null);
  const heartbeatRef = useRef(null);
  const userKeyRef = useRef(null);

  const { start, stop } = useBreathEngine({
    inhaleMs: preset.inMs,
    holdMs: preset.holdMs ?? 0,
    exhaleMs: preset.exMs,
    breaths: preset.breaths,
    onPhase: (nextPhase, breathsLeft) => {
      setPhase(nextPhase);
      setRemaining(breathsLeft);
      playPhaseSound(nextPhase);
      if (!circleRef.current) return;
      const el = circleRef.current;
      el.classList.remove('inhale','exhale','hold');
      el.classList.add(nextPhase);
      Array.from(el.classList).forEach(c => c.startsWith('dur-') && el.classList.remove(c));
      const dur = nextPhase === 'inhale' ? preset.inMs : nextPhase === 'exhale' ? preset.exMs : (preset.holdMs ?? 0);
      el.classList.add(`dur-${Math.max(dur,1)}`);
    },
    onDone: () => setPhase('done')
  });

  // Join presence & start engine
  useEffect(() => {
    let mounted = true;

    async function resolveUserKey() {
      // try auth user id, else browser key
      try {
        const { data: { user } } = await supabase.auth.getUser();
        return user?.id || getBrowserKey();
      } catch {
        return getBrowserKey();
      }
    }

    async function joinPresence(key) {
      const now = new Date().toISOString();
      await supabase.from('presence').upsert({ user_key: key, last_seen: now }, { onConflict: 'user_key' });
    }

    async function beat(key) {
      await supabase.from('presence').update({ last_seen: new Date().toISOString() }).eq('user_key', key);
    }

    async function leave(key) {
      await supabase.from('presence').delete().eq('user_key', key);
    }

    (async () => {
      const key = await resolveUserKey();
      if (!mounted) return;
      userKeyRef.current = key;

      await joinPresence(key);
      start();

      heartbeatRef.current = setInterval(() => beat(key), 15000);
      // one immediate beat so UI feels snappy
      beat(key);
    })();

    return () => {
      mounted = false;
      stop();
      stopAllSounds();
      clearInterval(heartbeatRef.current);
      if (userKeyRef.current) leave(userKeyRef.current);
    };
  }, [preset]);

  // Elapsed timer
  useEffect(() => {
    if (paused || phase === 'done') return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [paused, phase]);

  const handleRestart = () => {
    stop();
    stopAllSounds();
    setPhase('inhale');
    setRemaining(preset.breaths);
    setElapsed(0);
    setPaused(false);
    start();
    if (userKeyRef.current) {
      // refresh heartbeat timestamp on restart
      supabase.from('presence').update({ last_seen: new Date().toISOString() }).eq('user_key', userKeyRef.current);
    }
  };

  const handlePauseToggle = () => {
    if (!paused) {
      stop();
      stopAllSounds();
      setPaused(true);
    } else {
      setPhase('inhale');
      setRemaining(preset.breaths);
      setPaused(false);
      start();
      if (userKeyRef.current) {
        supabase.from('presence').update({ last_seen: new Date().toISOString() }).eq('user_key', userKeyRef.current);
      }
    }
  };

  const handleEnd = async () => {
    stop();
    stopAllSounds();
    clearInterval(heartbeatRef.current);
    if (userKeyRef.current) {
      await supabase.from('presence').delete().eq('user_key', userKeyRef.current);
    }
    onClose();
  };

  return (
    <div className="session-layout" role="dialog" aria-modal="true" aria-label="Breathing session">
      <div className={`session-main ${phase}`}>
        <div className={`focus-bg ${phase}`} />
        <div className="orb-wrap">
          <div ref={circleRef} className="orb inhale dur-4000">
            <span className="orb-label">
              {phase === 'done' ? 'All done' : phase === 'inhale' ? 'Breathe in' : phase === 'hold' ? 'Hold' : 'Breathe out'}
            </span>
          </div>
          <div className="orb-info">
            {phase !== 'done'
              ? <span className="counter">{remaining} {remaining === 1 ? 'breath' : 'breaths'} left</span>
              : <button className="btn primary" onClick={handleEnd}>Finish</button>}
          </div>
        </div>
        {paused && (
          <div className="paused-overlay" aria-live="polite">
            <div className="paused-card">
              <div className="paused-dot" />
              <div className="paused-text">Paused</div>
            </div>
          </div>
        )}
      </div>

      <aside className="session-panel">
        <h2 className="panel-title">{preset.label}</h2>
        <div className="panel-recipe">
          {preset.inMs/1000}s in{preset.holdMs ? ` • ${preset.holdMs/1000}s hold` : ''} • {preset.exMs/1000}s out
          <span className="panel-dot"> · </span>{preset.breaths} breaths
        </div>
        <div className="panel-timer">⏱ {formatMMSS(elapsed)}</div>
        <div className="panel-phase">
          <span className={`phase-pill ${phase}`}>{phase === 'done' ? 'Complete' : phase[0].toUpperCase()+phase.slice(1)}</span>
          {phase !== 'done' && <span className="phase-meta">· {remaining} {remaining === 1 ? 'breath' : 'breaths'} left</span>}
        </div>
        {preset.description && <p className="panel-desc">{preset.description}</p>}
        <div className="panel-actions">
          <button className="btn ghost" onClick={handlePauseToggle}>{paused ? 'Resume' : 'Pause'}</button>
          <button className="btn secondary" onClick={handleRestart}>Restart</button>
          <button className="btn danger" onClick={handleEnd}>End Session</button>
        </div>
      </aside>
    </div>
  );
}
