const COLOURS = { light: '#EEF1F6', dark: '#161A2E' };

// Resolves 'system' | 'light' | 'dark' and applies it to <html data-theme>
export function applyTheme(pref) {
  const dark = pref === 'dark' || (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const mode = dark ? 'dark' : 'light';
  document.documentElement.dataset.theme = mode;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COLOURS[mode]);
}
