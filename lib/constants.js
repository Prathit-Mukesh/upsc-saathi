export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const PRELIMS_SUBJECTS = [
  "Indian History",
  "Geography",
  "Indian Polity",
  "Economy",
  "Environment & Ecology",
  "Science & Technology",
  "Current Affairs",
  "Art & Culture",
  "Mixed / CSAT",
];

export const MAINS_PAPERS = [
  { id: "gs1", name: "GS Paper I", desc: "History, Geography, Society" },
  { id: "gs2", name: "GS Paper II", desc: "Governance, Polity, IR" },
  { id: "gs3", name: "GS Paper III", desc: "Economy, Science, Environment" },
  { id: "gs4", name: "GS Paper IV", desc: "Ethics, Integrity, Aptitude" },
  { id: "essay", name: "Essay", desc: "Essay Writing Practice" },
  { id: "optional", name: "Optional Subject", desc: "Your chosen optional" },
];

export const STATIC_BOOKS_PRESET = [
  {
    subject: "History",
    books: [
      "India's Struggle for Independence – Bipan Chandra",
      "Ancient India – R.S. Sharma",
      "Medieval India – Satish Chandra",
      "Art & Culture – Nitin Singhania",
    ],
  },
  {
    subject: "Geography",
    books: [
      "Certificate Physical & Human Geography – G.C. Leong",
      "Indian Geography – Majid Husain",
      "Oxford School Atlas",
    ],
  },
  {
    subject: "Polity",
    books: [
      "Indian Polity – M. Laxmikanth",
      "Introduction to the Constitution of India – D.D. Basu",
    ],
  },
  {
    subject: "Economy",
    books: [
      "Indian Economy – Ramesh Singh",
      "Indian Economy – Sanjeev Verma",
    ],
  },
  {
    subject: "Environment",
    books: ["Environment – Shankar IAS"],
  },
  {
    subject: "Science & Tech",
    books: ["Science & Technology – TMH"],
  },
  {
    subject: "Ethics",
    books: [
      "Ethics, Integrity & Aptitude – Lexicon",
      "Ethics – G. Subba Rao & P.N. Roy Chowdhury",
    ],
  },
];

export const DEFAULT_HABITS = [
  { id: "wake", label: "Woke up on time", icon: "🌅" },
  { id: "news", label: "Read newspaper / current affairs", icon: "📰" },
  { id: "prelims", label: "Prelims MCQ practice", icon: "🎯" },
  { id: "mains", label: "Mains answer writing", icon: "✍️" },
  { id: "revision", label: "Revision session", icon: "🔄" },
  { id: "exercise", label: "Physical exercise", icon: "🏃" },
  { id: "sleep", label: "Slept on time", icon: "😴" },
];
