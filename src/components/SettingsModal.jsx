import { useEffect } from 'react';

export default function SettingsModal({ open, onClose, settings, onChange }) {
  if (!open) return null;

  const set = (k, v) => onChange({ ...settings, [k]: v });

  // Close on Esc
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Settings">
      <div className="modal-card settings-modal">
        <header className="modal-header">
          <h2>Session Settings</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </header>

        {/* Summary */}
        <div className="summary-pill">
          <span>🫁 {settings.breaths} breaths</span>
          <span>• {settings.retention || 0}s hold</span>
          <span>• {settings.rounds} {settings.rounds === 1 ? 'round' : 'rounds'}</span>
        </div>

        {/* Settings Form */}
        <div className="form-grid">
          {/* Timing Section */}
          <section className="card-section">
            <h3>Timing</h3>

            <div className="field">
              <label htmlFor="inhale">Inhale</label>
              <div className="range-row">
                <input
                  id="inhale"
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={settings.inhale}
                  onChange={(e) => set('inhale', parseFloat(e.target.value))}
                />
                <span className="chip">{settings.inhale}s</span>
              </div>
            </div>

            <div className="field">
              <label htmlFor="retention">Hold</label>
              <div className="range-row">
                <input
                  id="retention"
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={settings.retention}
                  onChange={(e) => set('retention', parseFloat(e.target.value))}
                />
                <span className="chip">{settings.retention}s</span>
              </div>
            </div>

            <div className="field">
              <label htmlFor="exhale">Exhale</label>
              <div className="range-row">
                <input
                  id="exhale"
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  value={settings.exhale}
                  onChange={(e) => set('exhale', parseFloat(e.target.value))}
                />
                <span className="chip">{settings.exhale}s</span>
              </div>
            </div>
          </section>

          {/* Session Section */}
          <section className="card-section">
            <h3>Session</h3>

            <div className="field two">
              <div>
                <label htmlFor="breaths">Breaths</label>
                <input
                  id="breaths"
                  type="number"
                  min="1"
                  max="200"
                  value={settings.breaths}
                  onChange={(e) => set('breaths', parseInt(e.target.value || 0))}
                />
              </div>

              <div>
                <label htmlFor="rounds">Rounds</label>
                <input
                  id="rounds"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.rounds}
                  onChange={(e) => set('rounds', parseInt(e.target.value || 1))}
                />
              </div>
            </div>

            <div className="field two">
              <div>
                <label htmlFor="recovery">Recovery (s)</label>
                <input
                  id="recovery"
                  type="number"
                  min="0"
                  max="60"
                  value={settings.recovery}
                  onChange={(e) => set('recovery', parseInt(e.target.value || 0))}
                />
              </div>

              <div>
                <label htmlFor="transition">Transition (s)</label>
                <input
                  id="transition"
                  type="number"
                  min="0"
                  max="10"
                  value={settings.transition}
                  onChange={(e) => set('transition', parseInt(e.target.value || 0))}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="retentionIncrease">Hold increase per round (ms)</label>
              <input
                id="retentionIncrease"
                type="number"
                min="0"
                step="500"
                value={settings.retentionIncrease}
                onChange={(e) => set('retentionIncrease', parseInt(e.target.value || 0))}
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
