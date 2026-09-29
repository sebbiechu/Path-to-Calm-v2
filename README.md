# Path to Calm

A calming breathing app to help you pause, breathe and feel better, anytime, anywhere. Built by People Development.

## What it does
- Guided breathing with five exercises (Abdominal, Pursed-lip, 4-7-8, Coherent, Extended exhale)
- Custom timings, multiple rounds, rest between rounds and longer holds each round
- Sound cues (with a mute toggle) and a completion chime
- Progress tracking: minutes, days this week and sessions (stored in the browser)
- Eight milestone badges, each unlocking a short "why this works" card
- A four-step tour for new users (replay any time from "How it works")
- Keeps the screen awake during a session and pauses if the phone locks
- Installable as an app (PWA) and works offline
- Light and dark mode, following the device by default
- Voice cues for each phase, plus optional vibration for breathing silently (Android)
- Mood check before and after sessions, with an optional anonymous share

## Local development
```bash
npm install
cp .env.example .env.local   # then add your Supabase URL and anon key
npm run dev
npm test        # engine and stats tests
```

## Environment variables
Set these in Vercel (Project > Settings > Environment Variables) for Production and Preview:

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key |

Without them the app works normally; it just stops logging.

## Colleague link
Share the app internally as `https://pathtocalm.vercel.app/?colleague`. Colleagues who arrive this way get anonymous
mood sharing switched on by default, with a notice banner and a one-tap "Turn off". The app remembers them, so later
visits can use the plain link. Anyone arriving via the plain link (the public) keeps sharing off by default.

## Adding badge artwork
Five badges use placeholder emblems. To add art, save a square image (about 480px, .webp) in `public/images/` and set `img: '/images/name.webp'` on that badge in `src/data/badges.js`.

## Supabase tables
`sessions` (one empty row per session started) and `mood_checks` (before/after scores, exercise, length, date). Both are insert-only for the public key: the app can add rows but never read them back.

## Project structure
```
src/
  App.jsx               home screen, state, persistence
  components/           UI (BreathSession is the full-screen exercise)
  data/                 presets and badges
  lib/engine.js         builds and plays the breath timeline
  lib/audio.js          sound cues and chime
  lib/storage.js        safe localStorage helpers
  lib/telemetry.js      optional anonymous logging (plain fetch)
  lib/stats.js          streaks and mood summaries
  lib/cues.js           vibration cues
  lib/__tests__/        Vitest tests
  styles/               tokens, base, home, modal, session
```

Breathe in. Breathe out. Find your path to calm.
