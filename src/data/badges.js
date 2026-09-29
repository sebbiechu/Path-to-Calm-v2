// Milestone badges. `img` uses artwork; badges without it show a placeholder emblem
// (see BadgeArt.jsx). To add art later, drop a .webp in /public/images and set `img`.

export const BADGES = [
  {
    id: 'first',
    title: 'Cloudwalker',
    img: '/images/cloudwalker.webp',
    goal: 'Complete your first session',
    card: {
      title: 'Why slow breathing calms you',
      body: [
        'When you breathe out slowly, your heart rate dips slightly. This is controlled by the vagus nerve, part of the body’s “rest and digest” system.',
        'Slow, steady breathing, especially with a long exhale, gives that system more time to act. That is why a few minutes can take the edge off stress. Your breath is one of the few parts of your nervous system you can steer on purpose.',
      ],
    },
  },
  {
    id: 'explorer',
    title: 'Windseeker',
    emblem: 'explorer',
    goal: 'Try all five exercises',
    card: {
      title: 'Which exercise, when',
      body: [
        'Abdominal breathing is the foundation: slow breaths into your belly. Coherent breathing suits focus and everyday balance. Extended exhale works well when stress spikes.',
        '4-7-8 is popular before sleep. Pursed-lip breathing helps when you feel short of breath, for example after climbing stairs. Your mood chart will show which suits you best.',
      ],
    },
  },
  {
    id: 'week3',
    title: 'Dawnkeeper',
    emblem: 'week3',
    goal: 'Breathe on 3 days in one week',
    card: {
      title: 'Little and often',
      body: [
        'A few minutes on most days does more than one long session now and then. Short, regular practice is easier to fit in, and repetition is what turns slow breathing into something your body reaches for under pressure.',
        'In a Stanford study, people who did five minutes of breathing a day for a month reported better mood.',
      ],
    },
  },
  {
    id: 'evening',
    title: 'Lunaguide',
    img: '/images/lunaguide.webp',
    goal: 'Complete a session after 8pm',
    card: {
      title: 'Breathing before bed',
      body: [
        'Long exhales nudge your body towards rest, which is why techniques like 4-7-8 are popular before sleep.',
        'Pair it with a dim screen (dark mode helps) and try it lying down. If your mind wanders, that is normal: just return to the count.',
      ],
    },
  },
  {
    id: 'rounds',
    title: 'Tidewalker',
    emblem: 'rounds',
    goal: 'Complete a session with 2 or more rounds',
    card: {
      title: 'Rounds and rest',
      body: [
        'Rounds let you go deeper without straining. The rest between rounds lets your breathing settle before you start again.',
        'If you feel dizzy or tingly, rest for longer or shorten your holds. Calm breathing should never feel like a strain.',
      ],
    },
  },
  {
    id: 'hour',
    title: 'Stillwater',
    emblem: 'hour',
    goal: 'Breathe for 60 minutes in total',
    target: 60,
    card: {
      title: 'What an hour adds up to',
      body: [
        'Sixty minutes is roughly a dozen short sessions. Reviews of slow-breathing research link regular practice with lower stress and anxiety, and a calmer heart rate.',
        'The biggest change most people notice is not within a single session, but in how quickly they can settle when they need to.',
      ],
    },
  },
  {
    id: 'calmer5',
    title: 'Petalmind',
    img: '/images/petalmind.webp',
    goal: 'Feel calmer after 5 sessions (mood check)',
    target: 5,
    card: {
      title: 'Noticing the change',
      body: [
        'Rating how you feel before and after builds interoception: your awareness of what is happening inside your body.',
        'The sooner you notice early signs of tension, like a tight jaw or quick, shallow breaths, the sooner you can do something about it. Your chart shows which exercise helps you most.',
      ],
    },
  },
  {
    id: 'rhythm4',
    title: 'Evergrove',
    emblem: 'rhythm4',
    goal: 'Breathe in each of 4 weeks in a row',
    target: 4,
    card: {
      title: 'Making it stick',
      body: [
        'Habits stick best when they are attached to something you already do. Link a session to a fixed moment: before your first meeting, on a break or before a shift.',
        'Four weeks in, you have shown it fits your life. Research on habits suggests a routine takes around two months to feel automatic, so keep going.',
      ],
    },
  },
];

export const findBadge = (id) => BADGES.find((b) => b.id === id);

// v1/v2 awarded badges by XP. Keep whatever people had earned.
export const LEGACY_XP = [
  { id: 'first', xp: 150 },
  { id: 'evening', xp: 300 },
  { id: 'calmer5', xp: 450 },
];
