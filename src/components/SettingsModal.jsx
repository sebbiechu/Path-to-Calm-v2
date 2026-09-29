import { useEffect, useRef, useState } from 'react';
import Modal from './Modal.jsx';
import RhythmBar from './RhythmBar.jsx';
import { buildSteps, totalMs } from '../lib/engine.js';
import { aboutMinutes } from '../lib/format.js';
import { findPreset } from '../data/presets.js';
import { canVibrate } from '../lib/cues.js';
import Tip from './Tip.jsx';

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

function Slider({ id, label, min, max, step, value, onChange }) {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        <output htmlFor={id}>{value}s</output>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        aria-valuetext={`${value} seconds`}
      />
    </div>
  );
}

function Stepper({ id, label, hint, value, min, max, step = 1, onChange }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);

  const commit = (n) => {
    const next = Number.isFinite(n) ? clamp(Math.round(n), min, max) : value;
    onChange(next);
    setText(String(next));
  };

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {hint && <p className="field-hint">{hint}</p>}
      <div className="stepper">
        <button type="button" onClick={() => commit(value - step)} disabled={value <= min} aria-label={`Decrease ${label}`}>
          −
        </button>
        <input
          id={id}
          inputMode="numeric"
          value={text}
          onChange={(e) => setText(e.target.value.replace(/[^\d]/g, ''))}
          onBlur={() => commit(parseInt(text, 10))}
          onKeyDown={(e) => e.key === 'Enter' && commit(parseInt(text, 10))}
        />
        <button type="button" onClick={() => commit(value + step)} disabled={value >= max} aria-label={`Increase ${label}`}>
          +
        </button>
      </div>
    </div>
  );
}

function Toggle({ id, label, hint, checked, disabled, onChange }) {
  return (
    <div className={`toggle${disabled ? ' disabled' : ''}`}>
      <div>
        <label htmlFor={id}>{label}</label>
        {hint && <p className="field-hint">{hint}</p>}
      </div>
      <input
        id={id}
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
    </div>
  );
}

const TABS = [
  { id: 'session', label: 'Session' },
  { id: 'prefs', label: 'Preferences' },
];

function Tabs({ active, onChange }) {
  const refs = useRef({});
  const onKey = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = TABS.findIndex((t) => t.id === active);
    const next = TABS[(i + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length].id;
    onChange(next);
    refs.current[next]?.focus();
  };
  return (
    <div className="tabs" role="tablist" aria-label="Settings sections">
      {TABS.map((t) => (
        <button
          key={t.id}
          ref={(el) => (refs.current[t.id] = el)}
          type="button"
          role="tab"
          id={`tab-${t.id}`}
          aria-selected={active === t.id}
          aria-controls={`panel-${t.id}`}
          tabIndex={active === t.id ? 0 : -1}
          className="tab"
          onClick={() => onChange(t.id)}
          onKeyDown={onKey}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

const THEMES = [
  { value: 'system', label: 'Match device' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function SettingsModal({ settings, onSave, onClose }) {
  const [draft, setDraft] = useState(settings);
  const [tab, setTab] = useState('session');
  const set = (key) => (value) => setDraft((d) => ({ ...d, [key]: value }));
  const preset = findPreset(draft.presetId);
  const duration = totalMs(buildSteps(draft));

  const resetTimings = () =>
    setDraft((d) => ({ ...d, inhale: preset.inhale, hold: preset.hold, exhale: preset.exhale, breaths: preset.breaths }));

  return (
    <Modal
      title="Settings"
      onClose={onClose}
      className="settings"
      footer={
        <>
          {tab === 'session' ? <p className="footer-note">Total {aboutMinutes(duration)}</p> : <span className="footer-note" />}
          <button type="button" className="btn quiet" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn primary" onClick={() => onSave(draft)}>
            Save settings
          </button>
        </>
      }
    >
      <Tip id="settings">Changes apply from your next session. Tap Save settings when you’re done.</Tip>

      <Tabs active={tab} onChange={setTab} />

      <div role="tabpanel" id="panel-session" aria-labelledby="tab-session" hidden={tab !== 'session'} className="tab-panel">
      <section className="settings-group">
        <div className="group-head">
          <h3>Breath timing</h3>
          <button type="button" className="link-btn" onClick={resetTimings}>
            Reset to {preset.label}
          </button>
        </div>
        <RhythmBar inhale={draft.inhale} hold={draft.hold} exhale={draft.exhale} />
        <Slider id="inhale" label="Breathe in" min={1} max={10} step={0.5} value={draft.inhale} onChange={set('inhale')} />
        <Slider id="hold" label="Hold" min={0} max={20} step={1} value={draft.hold} onChange={set('hold')} />
        <Slider id="exhale" label="Breathe out" min={1} max={12} step={0.5} value={draft.exhale} onChange={set('exhale')} />
      </section>

      <section className="settings-group">
        <h3>Session</h3>
        <div className="field-row">
          <Stepper id="breaths" label="Breaths per round" value={draft.breaths} min={1} max={200} onChange={set('breaths')} />
          <Stepper id="rounds" label="Rounds" value={draft.rounds} min={1} max={10} onChange={set('rounds')} />
        </div>
        <div className="field-row">
          <Stepper
            id="rest"
            label="Rest between rounds"
            hint="Seconds of normal breathing"
            value={draft.rest}
            min={0}
            max={120}
            step={5}
            onChange={set('rest')}
          />
          <Stepper
            id="holdIncrease"
            label="Longer hold each round"
            hint="Seconds added per round, up to 30s per hold"
            value={draft.holdIncrease}
            min={0}
            max={30}
            onChange={set('holdIncrease')}
          />
        </div>
        {draft.rounds === 1 && (draft.rest > 0 || draft.holdIncrease > 0) && (
          <p className="field-hint">Rest and longer holds apply when you have more than one round.</p>
        )}
        <Stepper
          id="getReady"
          label="Get-ready countdown"
          hint="Seconds before the first breath"
          value={draft.getReady}
          min={0}
          max={10}
          onChange={set('getReady')}
        />
      </section>

      </div>

      <div role="tabpanel" id="panel-prefs" aria-labelledby="tab-prefs" hidden={tab !== 'prefs'} className="tab-panel">
      <section className="settings-group">
        <fieldset className="segmented">
          <legend>Appearance</legend>
          {THEMES.map((t) => (
            <label key={t.value}>
              <input
                type="radio"
                name="theme"
                value={t.value}
                checked={draft.theme === t.value}
                onChange={() => set('theme')(t.value)}
              />
              <span>{t.label}</span>
            </label>
          ))}
        </fieldset>
        <Toggle
          id="moodCheck"
          label="Mood check"
          hint="Rate how you feel before and after each session"
          checked={draft.moodCheck}
          onChange={set('moodCheck')}
        />
        <Toggle
          id="shareMood"
          label="Share anonymous mood scores"
          hint="Helps People Development see whether sessions help. Only your before and after scores, the exercise and session length are sent. Nothing that identifies you."
          checked={draft.moodCheck && draft.shareMood}
          disabled={!draft.moodCheck}
          onChange={set('shareMood')}
        />
        {canVibrate && (
          <Toggle
            id="vibrate"
            label="Vibrate on each phase"
            hint="A gentle buzz at each phase, so you can breathe silently with the sound off"
            checked={draft.vibrate}
            onChange={set('vibrate')}
          />
        )}
      </section>
      </div>
    </Modal>
  );
}
