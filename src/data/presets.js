// Timings are in seconds. `breaths` is the default count when the preset is picked.
export const PRESETS = [
  {
    id: 'abdominal',
    label: 'Abdominal',
    inhale: 4,
    hold: 0,
    exhale: 6,
    breaths: 30,
    description:
      'Also known as diaphragmatic or belly breathing. Engaging your diaphragm lets you take deep, efficient breaths that fully expand your lungs, slow your heart rate, lower blood pressure and help you relax.',
  },
  {
    id: 'pursed',
    label: 'Pursed-lip',
    inhale: 2,
    hold: 0,
    exhale: 4,
    breaths: 20,
    description:
      'Breathe in through your nose, then out slowly through pursed lips. This keeps your airways open for longer, easing shortness of breath and improving oxygen flow.',
  },
  {
    id: '478',
    label: '4-7-8',
    inhale: 4,
    hold: 7,
    exhale: 8,
    breaths: 8,
    description:
      'A relaxation method from pranayama yoga, popularised by Dr Andrew Weil. Breathe in for 4 seconds, hold for 7 and breathe out for 8. It activates the parasympathetic nervous system to reduce anxiety and help with sleep.',
  },
  {
    id: 'coherent',
    label: 'Coherent',
    inhale: 5.5,
    hold: 0,
    exhale: 5.5,
    breaths: 24,
    description:
      'Also called resonant breathing. Slow, even breaths at around five and a half a minute help balance the autonomic nervous system and reduce stress.',
  },
  {
    id: 'extended',
    label: 'Extended exhale',
    inhale: 4,
    hold: 0,
    exhale: 8,
    breaths: 20,
    description:
      'Breathing out for longer than you breathe in boosts parasympathetic activity, which is especially useful for reducing stress and calming the mind.',
  },
];

export const findPreset = (id) => PRESETS.find((p) => p.id === id) || PRESETS[0];

export function defaultSettings(preset = PRESETS[0]) {
  return {
    presetId: preset.id,
    inhale: preset.inhale,
    hold: preset.hold,
    exhale: preset.exhale,
    breaths: preset.breaths,
    rounds: 1,
    rest: 0,
    holdIncrease: 0,
    getReady: 3,
  };
}

// True when the timings no longer match the preset they started from
export function isCustomised(settings) {
  const p = findPreset(settings.presetId);
  return p.inhale !== settings.inhale || p.hold !== settings.hold || p.exhale !== settings.exhale;
}
