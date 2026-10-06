// Anonymous context sent with usage statistics. Nothing here identifies a person or device.

// Bracket rather than a count, so a single device can't be followed over time
export function visitBucket(n) {
  if (n <= 1) return 'first';
  if (n <= 5) return '2-5';
  return '6+';
}

export function deviceType() {
  try {
    return window.matchMedia('(pointer: coarse)').matches ? 'phone' : 'computer';
  } catch {
    return 'computer';
  }
}

// Opened from the home screen (installed app) rather than a browser tab
export function isInstalled() {
  try {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  } catch {
    return false;
  }
}
