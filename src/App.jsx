import { useCallback, useEffect, useMemo, useState } from 'react';
import PlanCard from './components/PlanCard.jsx';
import PresetPicker from './components/PresetPicker.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import DisclaimerModal from './components/DisclaimerModal.jsx';
import ProgressPanel from './components/ProgressPanel.jsx';
import BreathSession from './components/BreathSession.jsx';
import { PRESETS, findPreset, defaultSettings, isCustomised } from './data/presets.js';
import { XP_PER_SESSION } from './data/achievements.js';
import { buildSteps, totalMs } from './lib/engine.js';
import { logSessionStart, shareMood } from './lib/telemetry.js';
import { applyCompletion, currentStreak } from './lib/stats.js';
import { applyTheme } from './lib/theme.js';
import MoodScreen from './components/MoodScreen.jsx';
import * as audio from './lib/audio.js';
import { read, write, readNumber, readJSON, writeJSON, localDay } from './lib/storage.js';

// Bump this whenever the disclaimer wording changes
const DISCLAIMER_VERSION = '1.0.0';
const DISCLAIMER_KEY = 'disclaimer.v';

// Loads saved settings, falling back to the v1 "breaths" key
function loadSettings() {
  const base = defaultSettings();
  const saved = readJSON('ptc.settings', null);
  if (saved) return { ...base, ...saved };
  return { ...base, breaths: readNumber('breaths', base.breaths) };
}

// Loads stats, migrating the v1 keys (whole minutes, UTC day) so nobody loses progress
function loadStats() {
  const saved = readJSON('ptc.stats', null);
  if (saved) return saved;
  return {
    totalSeconds: readNumber('stats_minutes', 0) * 60,
    sessions: 0,
    streak: readNumber('stats_streak', 0),
    lastDay: read('stats_last_day', ''),
  };
}

function loadMoods() {
  try {
    return JSON.parse(read('ptc.moods', '[]'));
  } catch {
    return [];
  }
}

export default function App() {
  const [settings, setSettings] = useState(loadSettings);
  const [stats, setStats] = useState(loadStats);
  const [xp, setXp] = useState(() => readNumber('xp', 0));
  const [modal, setModal] = useState(() => (read(DISCLAIMER_KEY) === DISCLAIMER_VERSION ? null : 'disclaimer-block'));
  const [stage, setStage] = useState(null); // null | 'mood' | 'session'
  const [moodBefore, setMoodBefore] = useState(null);
  const [moods, setMoods] = useState(loadMoods);

  useEffect(() => writeJSON('ptc.settings', settings), [settings]);
  useEffect(() => writeJSON('ptc.stats', stats), [stats]);
  useEffect(() => write('xp', String(xp)), [xp]);
  useEffect(() => writeJSON('ptc.moods', moods.slice(-365)), [moods]);

  // Theme: apply now, and follow the phone if set to system
  useEffect(() => {
    applyTheme(settings.theme);
    if (settings.theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [settings.theme]);

  const preset = findPreset(settings.presetId);
  const durationMs = useMemo(() => totalMs(buildSteps(settings)), [settings]);

  const start = () => {
    audio.unlock();
    logSessionStart();
    setMoodBefore(null);
    setStage(settings.moodCheck ? 'mood' : 'session');
  };

  const beginBreathing = (mood) => {
    setMoodBefore(mood);
    setStage('session');
  };

  const handleMood = useCallback(
    (after, seconds) => {
      const entry = { day: localDay(), preset: settings.presetId, before: moodBefore, after, seconds };
      setMoods((m) => [...m, entry]);
      if (settings.shareMood) shareMood(entry);
    },
    [moodBefore, settings.presetId, settings.shareMood]
  );

  // Full session finished: minutes, streak, session count and XP
  const handleComplete = useCallback((seconds) => {
    setStats((s) => applyCompletion(s, seconds));
    setXp((x) => x + XP_PER_SESSION);
  }, []);

  // Leaving early still counts the minutes you breathed, but no XP or streak
  const handleExit = useCallback(({ seconds, completed }) => {
    if (!completed && seconds > 0) {
      setStats((s) => ({ ...s, totalSeconds: s.totalSeconds + seconds }));
    }
    setStage(null);
  }, []);

  return (
    <div className="page">
      <header className="site-header">
        <img className="logo logo-light" src="/images/people_logo.svg" alt="People Development" />
        <img className="logo logo-dark" src="/images/white_people_logo.svg" alt="People Development" />
      </header>

      <div className="layout">
        <main className="main">
          <section className="hero">
            <h1>Your breath, your power</h1>
            <p>Guided breathing for focus and calm. Pick an exercise, press start and follow the circle at your own pace.</p>
          </section>

          <PlanCard
            label={preset.label}
            customised={isCustomised(settings)}
            settings={settings}
            durationMs={durationMs}
            onChange={() => setModal('picker')}
          />

          <div className="actions">
            <button type="button" className="btn primary large" onClick={start}>
              Start session
            </button>
            <button type="button" className="btn quiet large" onClick={() => setModal('settings')}>
              Settings
            </button>
          </div>

          <button type="button" className="link-btn subtle" onClick={() => setModal('disclaimer')}>
            Medical disclaimer
          </button>
        </main>

        <aside className="aside">
          <ProgressPanel stats={{ ...stats, currentStreak: currentStreak(stats) }} xp={xp} moods={settings.moodCheck ? moods : null} />
        </aside>
      </div>

      {modal === 'picker' && (
        <PresetPicker
          presets={PRESETS}
          activeId={settings.presetId}
          onClose={() => setModal(null)}
          onSelect={(p) => {
            setSettings((s) => ({ ...s, presetId: p.id, inhale: p.inhale, hold: p.hold, exhale: p.exhale, breaths: p.breaths }));
            setModal(null);
          }}
        />
      )}

      {modal === 'settings' && (
        <SettingsModal
          settings={settings}
          onClose={() => setModal(null)}
          onSave={(next) => {
            setSettings(next);
            setModal(null);
          }}
        />
      )}

      {(modal === 'disclaimer' || modal === 'disclaimer-block') && (
        <DisclaimerModal
          blocking={modal === 'disclaimer-block'}
          onClose={() => setModal(null)}
          onAccept={() => {
            write(DISCLAIMER_KEY, DISCLAIMER_VERSION);
            setModal(null);
          }}
        />
      )}

      {stage === 'mood' && (
        <MoodScreen
          label={preset.label}
          onPick={beginBreathing}
          onSkip={() => beginBreathing(null)}
          onCancel={() => setStage(null)}
        />
      )}

      {stage === 'session' && (
        <BreathSession
          settings={settings}
          label={preset.label}
          moodBefore={moodBefore}
          onComplete={handleComplete}
          onMood={handleMood}
          onExit={handleExit}
        />
      )}
    </div>
  );
}
