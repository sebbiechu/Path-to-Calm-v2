# Path to Calm

A calming breathing app to help you pause, breathe and feel better, anytime, anywhere. Built by People Development.

## What it does
- Guided breathing with five exercises (Abdominal, Pursed-lip, 4-7-8, Coherent, Extended exhale)
- Custom timings, multiple rounds, rest between rounds and longer holds each round
- Sound cues (with a mute toggle) and a completion chime
- Progress tracking: minutes, day streak, sessions, XP and badges (stored in the browser)
- Keeps the screen awake during a session and pauses if the phone locks

## Local development
```bash
npm install
cp .env.example .env.local   # then add your Supabase URL and anon key
npm run dev
```

## Environment variables
Set these in Vercel (Project > Settings > Environment Variables) for Production and Preview:

| Name | Value |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key |

Without them the app works normally; it just stops logging session starts.

## Project structure
```
src/
  App.jsx               home screen, state, persistence
  components/           UI (BreathSession is the full-screen exercise)
  data/                 presets and badges
  lib/engine.js         builds and plays the breath timeline
  lib/audio.js          sound cues and chime
  lib/storage.js        safe localStorage helpers
  lib/supabase.js       optional session logging
  styles/               tokens, base, home, modal, session
```

Breathe in. Breathe out. Find your path to calm.
