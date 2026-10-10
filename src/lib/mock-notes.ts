import type { Mood, Note, Reply } from "@/lib/notes";

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

type Seed = { body: string; mood: Mood | null; minutes: number; kindness: number };

/**
 * Sample notes for the prototype. These are written for the mockup and will be
 * replaced by real published notes once the database is connected.
 */
const SEEDS: Seed[] = [
  {
    body: "Dear younger me, the friends who make you feel small are not the only friends you will ever have. Hold on. The good ones are coming, and one of them will lend you a yellow umbrella.",
    mood: "hope",
    minutes: 14,
    kindness: 12,
  },
  {
    body: "I'm sorry I left your birthday early. I said I had a headache. I didn't. I just felt like I didn't belong there, and I never told you that.",
    mood: "apology",
    minutes: 52,
    kindness: 31,
  },
  {
    body: "To the stranger on the 7:40 bus who shared half a croissant with me when I was crying: you probably forgot. I didn't.",
    mood: "love",
    minutes: 130,
    kindness: 48,
  },
  {
    body: "I have been pronouncing 'quinoa' wrong at work for three years and at this point I have to commit to it forever.",
    mood: "funny",
    minutes: 205,
    kindness: 22,
  },
  {
    body: "Grandpa, I still have the voicemail where you say 'call me back, kiddo.' I never called back that week. I listen to it on the hard days.",
    mood: "regret",
    minutes: 380,
    kindness: 64,
  },
  {
    body: "A tiny thing that made me happy today: the barista drew a lopsided cat in my latte foam and looked so proud of it.",
    mood: "life",
    minutes: 610,
    kindness: 17,
  },
  {
    body: "I moved to a new city two months ago and nobody here knows my name yet. Some days that feels like freedom. Today it just feels quiet.",
    mood: "life",
    minutes: 25,
    kindness: 0,
  },
  {
    body: "I think I still love you a little. Not in a way that wants anything back. Just in the way you keep a key to a house you don't live in anymore.",
    mood: "love",
    minutes: 95,
    kindness: 0,
  },
  {
    body: "Dear me at 30: I hope you finally learned to rest without feeling like you have to earn it first.",
    mood: "hope",
    minutes: 720,
    kindness: 1,
  },
  {
    body: "I told my sister her painting was 'interesting' and I've regretted that word every day since. It was beautiful. I was jealous.",
    mood: "apology",
    minutes: 1440,
    kindness: 0,
  },
  {
    body: "My cat knocked my phone into the bath during a job interview call. I got the job. I've never told them why I suddenly went silent for a minute.",
    mood: "funny",
    minutes: 2100,
    kindness: 9,
  },
  {
    body: "I never said goodbye to my childhood home. We just drove away on a Tuesday and I thought there would be more time.",
    mood: "regret",
    minutes: 3000,
    kindness: 2,
  },
];

export const MOCK_REPLIES: Reply[] = [
  { id: "mock-r1", noteId: "mock-3", body: "This made my morning. Croissant people are the best people.", createdAt: minutesAgo(100) },
  { id: "mock-r2", noteId: "mock-3", body: "I hope they find this somehow.", createdAt: minutesAgo(60) },
  { id: "mock-r3", noteId: "mock-5", body: "Keep that voicemail forever. He knew you loved him.", createdAt: minutesAgo(300) },
  { id: "mock-r4", noteId: "mock-1", body: "Saving this one for my little brother.", createdAt: minutesAgo(8) },
];

export const MOCK_NOTES: Note[] = SEEDS.map((s, i) => {
  const id = `mock-${i + 1}`;
  return {
    id,
    body: s.body,
    mood: s.mood,
    publishedAt: minutesAgo(s.minutes),
    kindnessCount: s.kindness,
    replyCount: MOCK_REPLIES.filter((r) => r.noteId === id).length,
  };
});
