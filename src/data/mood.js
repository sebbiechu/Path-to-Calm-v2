export const MOODS = [
  { value: 1, label: 'Very tense' },
  { value: 2, label: 'Tense' },
  { value: 3, label: 'Okay' },
  { value: 4, label: 'Calm' },
  { value: 5, label: 'Very calm' },
];

export const moodLabel = (n) => MOODS.find((m) => m.value === n)?.label ?? '';
