import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PlanCard from './components/PlanCard.jsx';
import PresetPicker from './components/PresetPicker.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import DisclaimerModal from './components/DisclaimerModal.jsx';
import ProgressPanel from './components/ProgressPanel.jsx';
import BreathSession from './components/BreathSession.jsx';
import { PRESETS, findPreset, defaultSettings, isCustomised, OLD_DEFAULT_BREATHS } from './data/presets.js';
import { BADGES, LEGACY_XP, findBadge } from './data/badges.js';
import { evaluateBadges, daysThisWeek } from './lib/badges.js';
import BadgeModal from './components/BadgeModal.jsx';
import { buildSteps, totalMs } from './lib/engine.js';
import { logSessionStart, logSessionEnd, shareMood } from './lib/telemetry.js';
import { visitBucket, deviceType, isInstalled } from './lib/context.js';
import { applyCompletion } from './lib/stats.js';
import { applyTheme } from './lib/theme.js';
import MoodScreen from './components/MoodScreen.jsx';
import Tour from './components/Tour.jsx';
import { FEEDBACK_URL } from './data/links.js';
import ShareNotice from './components/ShareNotice.jsx';
import * as audio from './lib/audio.js';
import { read, write, readNumber, readJSON, writeJSON, localDay } from './lib/storage.js';

// Bump this whenever the disclaimer wording changes
const DISCLAIMER_VERSION = '1.0.0';
const DISCLAIMER_KEY = 'disclaimer.v';

// Colleagues are recognised by the internal link (?colleague), or as a safety net by arriving
// from the AS Watson Europe Cornerstone site (also matches its staging/pilot variants).
const CORNERSTONE = /^aswatsoneurope(-[a-z0-9]+)?\.csod\.com$/i;

function cameFromCornerstone() {
  try {
    return Boolean(document.referrer) && CORNERSTONE.test(new URL(document.referrer).hostname);
  } catch {
    return false;
  }
}

// Remember colleagues on this device, then tidy the URL
function detectColleague() {
  try {
    if (cameFromCornerstone()) write('ptc.colleague', '1');
    const params = new URLSearchParams(window.location.search);
    if (params.has('colleague')) {
      write('ptc.colleague', '1');
      params.delete('colleague');
      const query = params.toString();
      window.history.replaceState(null, '', window.location.pathname + (query ? `?${query}` : '') + window.location.hash);
    }
  } catch {
    // no URL access: treat as public
  }
  return read('ptc.colleague') === '1';
}
const IS_COLLEAGUE = typeof window !== 'undefined' && detectColleague();

// Loads saved settings, falling back to the v1 "breaths" key
function loadSettings() {
  const base = defaultSettings();
  // Colleagues share by default, unless they've already said no
  if (IS_COLLEAGUE && read('ptc.shareAsked') !== '1') base.shareMood = true;
  const saved = readJSON('ptc.settings', null);
  if (saved) {
    const settings = { ...base, ...saved };
    if (IS_COLLEAGUE && read('ptc.shareAsked') !== '1' && read('ptc.shareNoticed') !== '1') settings.shareMood = true;
    // Anyone still on an old default breath count moves to the new shorter default
    if (!saved.defaultsV2 && settings.breaths === OLD_DEFAULT_BREATHS[settings.presetId]) {
      settings.breaths = findPreset(settings.presetId).breaths;
    }
    return { ...settings, defaultsV2: true };
  }
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

function loadList(key) {
  try {
    const v = JSON.parse(read(key, '[]'));
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// Earned badges as { id: 'YYYY-MM-DD' }. First run: carry over badges earned with the old XP system.
function loadEarned() {
  const saved = readJSON('ptc.badges', null);
  if (saved) return saved;
  const xp = readNumber('xp', 0);
  const today = localDay();
  return Object.fromEntries(LEGACY_XP.filter((l) => xp >= l.xp).map((l) => [l.id, today]));
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
  const [history, setHistory] = useState(() => loadList('ptc.history'));
  const [earned, setEarned] = useState(loadEarned);
  const [newBadges, setNewBadges] = useState([]);
  const [openBadge, setOpenBadge] = useState(null); // { id } opened from the panel
  const [badgeQueue, setBadgeQueue] = useState([]); // new badges to show one after another
  const newBadgesRef = useRef([]);
  useEffect(() => {
    newBadgesRef.current = newBadges;
  }, [newBadges]);
  const [modal, setModal] = useState(() => (read(DISCLAIMER_KEY) === DISCLAIMER_VERSION ? null : 'disclaimer-block'));
  const [tourDone, setTourDone] = useState(() => read('ptc.tourDone') === '1');
  const [touring, setTouring] = useState(false);
  const [shareAsked, setShareAsked] = useState(() => read('ptc.shareAsked') === '1');
  const [shareNoticed, setShareNoticed] = useState(() => read('ptc.shareNoticed') === '1');
  const [stage, setStage] = useState(null); // null | 'mood' | 'session'
  const [moodBefore, setMoodBefore] = useState(null);
  const [moods, setMoods] = useState(loadMoods);

  useEffect(() => writeJSON('ptc.settings', settings), [settings]);
  useEffect(() => writeJSON('ptc.stats', stats), [stats]);
  useEffect(() => writeJSON('ptc.history', history.slice(-1000)), [history]);
  useEffect(() => writeJSON('ptc.badges', earned), [earned]);

  // Work out badge progress, and spot anything newly earned
  const badgeStatus = useMemo(
    () => evaluateBadges({ history, moods, totalSeconds: stats.totalSeconds }),
    [history, moods, stats.totalSeconds]
  );
  useEffect(() => {
    const fresh = BADGES.filter((b) => badgeStatus[b.id]?.done && !earned[b.id]).map((b) => b.id);
    if (!fresh.length) return;
    const today = localDay();
    setEarned((e) => ({ ...e, ...Object.fromEntries(fresh.map((id) => [id, today])) }));
    setNewBadges((n) => [...n, ...fresh]);
  }, [badgeStatus, earned]);
  useEffect(() => writeJSON('ptc.moods', moods.slice(-365)), [moods]);

  // First visit: show the tour once the disclaimer is accepted
  useEffect(() => {
    if (!tourDone && modal === null && stage === null) setTouring(true);
  }, [tourDone, modal, stage]);

  const endTour = useCallback(() => {
    setTouring(false);
    setTourDone(true);
    write('ptc.tourDone', '1');
  }, []);

  // Wipe progress on this device (settings are kept)
  const resetProgress = () => {
    setStats({ totalSeconds: 0, sessions: 0, streak: 0, lastDay: '' });
    setHistory([]);
    setMoods([]);
    setEarned({});
    setNewBadges([]);
    setBadgeQueue([]);
    ['xp', 'stats_minutes', 'stats_streak', 'stats_last_day'].forEach((k) => {
      try {
        localStorage.removeItem(k); // old keys, so nothing is carried over again
      } catch {
        // storage unavailable
      }
    });
  };

  const answerShare = (yes) => {
    setSettings((s) => ({ ...s, shareMood: yes }));
    setShareAsked(true);
    write('ptc.shareAsked', '1');
  };

  // Colleague notice: OK keeps sharing on, Turn off opts out. Either way it counts as answered.
  const answerNotice = (keepOn) => {
    answerShare(keepOn);
    setShareNoticed(true);
    write('ptc.shareNoticed', '1');
  };
  const showNotice = IS_COLLEAGUE && !shareNoticed && !shareAsked && tourDone && !touring && modal === null && stage === null;

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
    const starts = readNumber('ptc.starts', 0) + 1;
    write('ptc.starts', String(starts));
    if (settings.shareUsage) {
      logSessionStart({
        preset: settings.presetId,
        plannedSeconds: Math.round(durationMs / 1000),
        audience: IS_COLLEAGUE ? 'colleague' : 'public',
        device: deviceType(),
        installed: isInstalled(),
        visit: visitBucket(starts),
      });
    }
    setMoodBefore(null);
    setNewBadges([]);
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

  // Full session finished: minutes, session count and a history entry for badges
  const logEnd = useCallback(
    (seconds, completed) => {
      if (!settings.shareUsage) return;
      logSessionEnd({
        preset: settings.presetId,
        plannedSeconds: Math.round(durationMs / 1000),
        seconds,
        completed,
        audience: IS_COLLEAGUE ? 'colleague' : 'public',
        device: deviceType(),
      });
    },
    [settings.shareUsage, settings.presetId, durationMs]
  );

  const handleComplete = useCallback(
    (seconds) => {
      logEnd(seconds, true);
      setStats((s) => applyCompletion(s, seconds));
      setHistory((h) => [
        ...h,
        { day: localDay(), hour: new Date().getHours(), preset: settings.presetId, seconds, rounds: settings.rounds },
      ]);
    },
    [settings.presetId, settings.rounds, logEnd]
  );

  // Leaving early still counts the minutes you breathed. On finishing, show any new badge.
  const handleExit = useCallback(
    ({ seconds, completed }) => {
      if (!completed) {
        logEnd(seconds, false);
        if (seconds > 0) setStats((s) => ({ ...s, totalSeconds: s.totalSeconds + seconds }));
      }
      setStage(null);
      setBadgeQueue(newBadgesRef.current);
      setNewBadges([]);
    },
    [logEnd]
  );

  return (
    <div className={`page${showNotice ? ' has-notice' : ''}`}>
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
            <button type="button" className="btn primary large" onClick={start} data-tour="start">
              Start session
            </button>
            <button type="button" className="btn quiet large" onClick={() => setModal('settings')} data-tour="settings">
              Settings
            </button>
          </div>

          <div className="meta-links">
            <button type="button" className="link-btn subtle" onClick={() => setTouring(true)}>
              How it works
            </button>
            <a className="link-btn subtle" href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer">
              Give feedback
            </a>
            <button type="button" className="link-btn subtle" onClick={() => setModal('disclaimer')}>
              Medical disclaimer
            </button>
          </div>
        </main>

        <aside className="aside">
          <ProgressPanel
            stats={stats}
            weekDays={daysThisWeek(history)}
            moods={settings.moodCheck ? moods : null}
            earned={earned}
            status={badgeStatus}
            onOpenBadge={(id) => setOpenBadge({ id })}
            showSharePrompt={settings.moodCheck && !settings.shareMood && !shareAsked && moods.length > 0}
            onShareAnswer={answerShare}
          />
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
          onReset={resetProgress}
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

      {touring && <Tour onClose={endTour} />}

      {showNotice && <ShareNotice onOk={() => answerNotice(true)} onTurnOff={() => answerNotice(false)} />}

      {(badgeQueue.length > 0 || openBadge) && (
        <BadgeModal
          key={badgeQueue[0] || openBadge.id}
          badge={findBadge(badgeQueue[0] || openBadge.id)}
          earnedOn={earned[badgeQueue[0] || openBadge.id]}
          status={badgeStatus[badgeQueue[0] || openBadge.id]}
          isNew={badgeQueue.length > 0}
          remaining={Math.max(0, badgeQueue.length - 1)}
          onClose={() => (badgeQueue.length ? setBadgeQueue((q) => q.slice(1)) : setOpenBadge(null))}
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
          newBadges={newBadges.map(findBadge)}
          onComplete={handleComplete}
          onMood={handleMood}
          onExit={handleExit}
        />
      )}
    </div>
  );
}
