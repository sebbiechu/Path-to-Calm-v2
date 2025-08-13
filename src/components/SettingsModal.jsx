import { useEffect, useMemo } from 'react';

function Stepper({ id, value, min=0, max=999, step=1, onChange, ariaLabel }) {
  const dec = () => onChange(Math.max(min, (value ?? 0) - step));
  const inc = () => onChange(Math.min(max, (value ?? 0) + step));
  return (
    <div className="stepper" role="group" aria-label={ariaLabel || id}>
      <button type="button" className="stepper-btn" onClick={dec} aria-label={`Decrease ${id}`}>−</button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(parseInt(e.target.value || 0))}
        className="stepper-input"
      />
      <button type="button" className="stepper-btn" onClick={inc} aria-label={`Increase ${id}`}>+</button>
    </div>
  );
}

function LabeledRange({ id, label, min, max, step, value, suffix="s", onChange }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="range-wrap">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="range"
          aria-label={`${label} ${value}${suffix}`}
        />
        <span className="bubble" aria-hidden="true">{value}{suffix}</span>
      </div>
    </div>
  );
}

export default function SettingsModal({ open, onClose, settings, onChange }) {
  if (!open) return null;

  const set = (k, v) => onChange({ ...settings, [k]: v });

  // Close on Esc
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Click outside to close
  const onOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) onClose();
  };

  const totals = useMemo(() => {
    const inhale = Number(settings.inhale || 0);
    const hold = Number(settings.retention || 0);
    const exhale = Number(settings.exhale || 0);
    const total = Math.max(1, inhale + hold + exhale);
    return {
      inhale,
      hold,
      exhale,
      total,
      pctIn: (inhale / total) * 100,
      pctHold: (hold / total) * 100,
      pctEx: (exhale / total) * 100,
    };
  }, [settings.inhale, settings.retention, settings.exhale]);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Settings" onClick={onOverlayClick}>
      <div className="modal-card settings-modal">
        <header className="modal-header modal-header--gradient">
          <div className="modal-title">
            <div className="modal-kicker">Path to Calm</div>
            <h2>Session Settings</h2>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </header>

        {/* Summary / quick stats */}
        <div className="summary">
          <div className="summary-left">
            <div className="summary-pill">
              <span>🫁 {settings.breaths} breaths</span>
              <span>• {settings.retention || 0}s hold</span>
              <span>• {settings.rounds} {settings.rounds === 1 ? 'round' : 'rounds'}</span>
            </div>
            <div className="timeline" aria-label="Breath cycle timeline preview">
              <div className="timeline-bar">
                <span className="seg seg-inhale" style={{ width: `${totals.pctIn}%` }} />
                <span className="seg seg-hold" style={{ width: `${totals.pctHold}%` }} />
                <span className="seg seg-exhale" style={{ width: `${totals.pctEx}%` }} />
              </div>
              <div className="timeline-legend">
                <span>Inhale {settings.inhale}s</span>
                <span>Hold {settings.retention || 0}s</span>
                <span>Exhale {settings.exhale}s</span>
                <span className="total">Total {totals.total}s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="form-grid">
          {/* Timing */}
          <section className="card-section">
            <div className="card-head">
              <h3>Timing</h3>
              <p className="sub">Fine‑tune the breathing cycle</p>
            </div>

            <LabeledRange
              id="inhale"
              label="Inhale"
              min={1}
              max={10}
              step={0.5}
              value={settings.inhale}
              onChange={(v) => set('inhale', v)}
            />
            <LabeledRange
              id="retention"
              label="Hold"
              min={0}
              max={20}
              step={1}
              value={settings.retention}
              onChange={(v) => set('retention', v)}
            />
            <LabeledRange
              id="exhale"
              label="Exhale"
              min={1}
              max={12}
              step={0.5}
              value={settings.exhale}
              onChange={(v) => set('exhale', v)}
            />
          </section>

          {/* Session */}
          <section className="card-section">
            <div className="card-head">
              <h3>Session</h3>
              <p className="sub">Structure your rounds</p>
            </div>

            <div className="field two">
              <div>
                <label htmlFor="breaths">Breaths</label>
                <Stepper
                  id="breaths"
                  value={settings.breaths}
                  min={1}
                  max={200}
                  step={1}
                  onChange={(v) => set('breaths', v)}
                  ariaLabel="Breaths count"
                />
              </div>
              <div>
                <label htmlFor="rounds">Rounds</label>
                <Stepper
                  id="rounds"
                  value={settings.rounds}
                  min={1}
                  max={10}
                  step={1}
                  onChange={(v) => set('rounds', v)}
                  ariaLabel="Rounds count"
                />
              </div>
            </div>

            <div className="field two">
              <div>
                <label htmlFor="recovery">Recovery (s)</label>
                <Stepper
                  id="recovery"
                  value={settings.recovery}
                  min={0}
                  max={60}
                  step={1}
                  onChange={(v) => set('recovery', v)}
                  ariaLabel="Recovery seconds"
                />
              </div>
              <div>
                <label htmlFor="transition">Transition (s)</label>
                <Stepper
                  id="transition"
                  value={settings.transition}
                  min={0}
                  max={10}
                  step={1}
                  onChange={(v) => set('transition', v)}
                  ariaLabel="Transition seconds"
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="retentionIncrease">Hold increase per round (ms)</label>
              <Stepper
                id="retentionIncrease"
                value={settings.retentionIncrease}
                min={0}
                max={60000}
                step={500}
                onChange={(v) => set('retentionIncrease', v)}
                ariaLabel="Hold increase per round in milliseconds"
              />
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="modal-footer">
          <button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={onClose}>Save</button>
        </footer>
      </div>
    </div>
  );
}
