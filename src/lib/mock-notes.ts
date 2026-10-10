import type { Note } from "@/lib/notes";

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

/**
 * Sample notes for the visual prototype. These are written for the mockup and
 * will be replaced by real published notes once the database is connected.
 */
export const MOCK_NOTES: Note[] = [
  {
    id: "mock-1",
    body: "Dear younger me, the friends who make you feel small are not the only friends you will ever have. Hold on. The good ones are coming, and one of them will lend you a yellow umbrella.",
    mood: "hope",
    publishedAt: minutesAgo(14),
    kindnessCount: 12,
  },
  {
    id: "mock-2",
    body: "I'm sorry I left your birthday early. I said I had a headache. I didn't. I just felt like I didn't belong there, and I never told you that.",
    mood: "apology",
    publishedAt: minutesAgo(52),
    kindnessCount: 31,
  },
  {
    id: "mock-3",
    body: "To the stranger on the 7:40 bus who shared half a croissant with me when I was crying: you probably forgot. I didn't.",
    mood: "love",
    publishedAt: minutesAgo(130),
    kindnessCount: 48,
  },
  {
    id: "mock-4",
    body: "I have been pronouncing 'quinoa' wrong at work for three years and at this point I have to commit to it forever.",
    mood: "funny",
    publishedAt: minutesAgo(205),
    kindnessCount: 22,
  },
  {
    id: "mock-5",
    body: "Grandpa, I still have the voicemail where you say 'call me back, kiddo.' I never called back that week. I listen to it on the hard days.",
    mood: "regret",
    publishedAt: minutesAgo(380),
    kindnessCount: 64,
  },
  {
    id: "mock-6",
    body: "A tiny thing that made me happy today: the barista drew a lopsided cat in my latte foam and looked so proud of it.",
    mood: "life",
    publishedAt: minutesAgo(610),
    kindnessCount: 17,
  },
];
