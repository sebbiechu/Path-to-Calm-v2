import { useEffect, useState } from 'react';
import WelcomeHero from './components/WelcomeHero.jsx';
import BreathSession from './components/BreathSession.jsx';
import ProgressPanel from './components/ProgressPanel.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import DisclaimerModal from './components/DisclaimerModal.jsx';
import SessionSummary from './components/SessionSummary.jsx';
import PresetPickerModal from './components/PresetPickerModal.jsx';
import CommunityPulse from './components/CommunityPulse.jsx';
import * as store from './utils/storage.js';
import { supabase } from './utils/supabaseClient.js';
import { XP_PER_SESSION, ACHIEVEMENTS } from './utils/achievements.js';

// Bump this whenever you change the disclaimer wording
const DISCLAIMER_VERSION = '1.0.0';
const DISCLAIMER_KEY = 'disclaimer.v';

const PRESETS = [
  {
    id: 'abdominal',
    label: 'Abdominal',
    inMs: 4000,
    exMs: 6000,
    breaths: 30,
    description:
      'Also known as diaphragmatic or belly breathing, this technique involves engaging your diaphragm to take deep, efficient breaths that fully expand your lungs, slow your heart rate, lower blood pressure, and promote relaxation.',
  },
  {
    id: 'pursed',
    label: 'Pursed-lip',
    inMs: 2000,
    exMs: 4000,
    breaths: 20,
    description:
      'Inhale through the nose, then exhale slowly through pursed lips — this helps create airway pressure that keeps passages open longer, easing shortness of breath and improving oxygen flow.',
  },
  {
    id: '478',
    label: '4-7-8',
    holdMs: 7000,
    inMs: 4000,
    exMs: 8000,
    breaths: 8,
    description:
      'A relaxation method from pranayama yoga popularized by Dr. Andrew Weil — inhale for 4 seconds, hold for 7, and exhale for 8. It activates the parasympathetic system to reduce anxiety and help with sleep.',
  },
  {
    id: 'coherent',
    label: 'Coherent',
    inMs: 5500,
    exMs: 5500,
    breaths: 24,
    description:
      'Also known as coherent or resonant breathing — involves taking slow, deliberate breaths (about 5 per minute, ~6 seconds each). It helps balance the autonomic nervous system and reduce stress.',
  },
  {
    id: 'extended',
    label: 'Extended exhale',
    inMs: 4000,
    exMs: 8000,
    breaths: 20,
    description:
      'This technique emphasizes a longer exhale compared to inhale, which boosts parasympathetic activity and promotes relaxation—especially useful for reducing stress and calming the mind.',
  },
];

// Log a session to Supabase
async function logSession() {
  const { error } = await supabase.from('sessions').insert({});
  if (error) console.error('Error logging session:', error.message);
}

export default function App() {
  const [activePreset, setActivePreset] = useState(PRESETS[0]);
  const [running, setRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  // Disclaimer modal mode: 'block' requires accept; 'view' can be closed
  const [disclaimerMode, setDisclaimerMode] = useState('block');

  // XP & achievements
  const [xp, setXp] = useState(() => store.getNumber('xp', 0));
  useEffect(() => {
    store.setNumber('xp', xp);
  }, [xp]);

  const unlockedBadges = ACHIEVEMENTS.filter((a) => xp >= a.threshold).map((a) => a.id);

  // Settings
  const [settings, setSettings] = useState(() => ({
    breaths: store.getNumber('breaths', activePreset.breaths),
    retention: (activePreset.holdMs || 0) / 1000,
    rounds: 1,
    inhale: activePreset.inMs / 1000,
    exhale: activePreset.exMs / 1000,
    recovery: 0,
    transition: 0,
    retentionIncrease: 0,
  }));

  useEffect(() => {
    store.setNumber('breaths', settings.breaths);
  }, [settings.breaths]);

  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      inhale: activePreset.inMs / 1000,
      exhale: activePreset.exMs / 1000,
      retention: (activePreset.holdMs || 0) / 1000,
    }));
  }, [activePreset]);

  useEffect(() => {
    document.body.style.overflow = running ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [running]);

  const sessionPreset = {
    ...activePreset,
    breaths: settings.breaths,
    inMs: settings.inhale * 1000,
    exMs: settings.exhale * 1000,
    holdMs: settings.retention * 1000,
    recoveryMs: settings.recovery * 1000,
    rounds: settings.rounds,
    transitionMs: settings.transition * 1000,
    retentionIncrease: settings.retentionIncrease * 1000,
  };

  // Show disclaimer on first visit or when version changes
  useEffect(() => {
    const acceptedVersion = store.get(DISCLAIMER_KEY, null);
    if (acceptedVersion !== DISCLAIMER_VERSION) {
      setDisclaimerMode('block');
      setShowDisclaimer(true);
    }
  }, []);

  // When a session ends: close + add XP
  function handleSessionEnd() {
    setRunning(false);
    setXp((prev) => prev + XP_PER_SESSION);
  }

  return (
    <div className="page">
      <div className="container">
        <div className="grid-main">
          {/* LEFT: centered main column */}
          <main className="main-rail">
            <div className="logo-fixed">
              <img src="/images/people.svg" alt="People Development" />
            </div>

            <WelcomeHero />

            <section className="center-rail">
              <SessionSummary
                summary={{
                  breaths: settings.breaths,
                  retention: settings.retention,
                  rounds: settings.rounds,
                  label: activePreset.label,
                }}
                onOpenPicker={() => setShowPicker(true)}
              />

              <div className="primary-cta">
                {/* People are breathing */}
                <div className="community-center">
                  <CommunityPulse />
                </div>

                {/* Start & Settings buttons */}
                <div className="cta-row">
                  <button
                    className="btn primary"
                    onClick={() => {
                      logSession();
                      setRunning(true);
                    }}
                  >
                    Start session
                  </button>
                  <button className="btn ghost" onClick={() => setShowSettings(true)}>
                    ⚙ Settings
                  </button>
                </div>

                {/* Medical Disclaimer */}
                <div className="cta-meta">
                  <button
                    className="text-link"
                    onClick={() => {
                      setDisclaimerMode('view'); // view-only mode
                      setShowDisclaimer(true);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="icon-info"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12" y2="16" />
                    </svg>
                    Medical Disclaimer
                  </button>
                </div>
              </div>
            </section>
          </main>

          {/* RIGHT: progress & badges */}
          <aside className="side-rail">
             <ProgressPanel unlockedBadges={unlockedBadges} xp={xp} />
          </aside>
        </div>
      </div>

      {/* Modals */}
      {showPicker && (
        <PresetPickerModal
          open={showPicker}
          presets={PRESETS}
          activeId={activePreset.id}
          onSelect={(p) => setActivePreset(p)}
          onClose={() => setShowPicker(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          open={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onChange={setSettings}
        />
      )}

      {showDisclaimer && (
        <DisclaimerModal
          open={showDisclaimer}
          mode={disclaimerMode}
          onAccept={() => {
            store.set(DISCLAIMER_KEY, DISCLAIMER_VERSION);
            setShowDisclaimer(false);
          }}
          onClose={() => {
            // Only allow closing if in view mode
            if (disclaimerMode === 'view') setShowDisclaimer(false);
          }}
        />
      )}

      {running && <BreathSession preset={sessionPreset} onClose={handleSessionEnd} />}
    </div>
  );
}
