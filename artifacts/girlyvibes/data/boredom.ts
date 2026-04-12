export interface Activity {
  id: string;
  title: string;
  icon: string;
  category: string;
  duration: string;
  color: string;
}

export const ACTIVITIES: Activity[] = [
  { id: "a1", title: "Rearrange your room", icon: "sofa-outline", category: "Home", duration: "1-2 hrs", color: "#FBE4EC" },
  { id: "a2", title: "Start a vision board", icon: "image-multiple-outline", category: "Creativity", duration: "1 hr", color: "#F7C9D9" },
  { id: "a3", title: "Write a letter to your future self", icon: "email-outline", category: "Reflection", duration: "30 min", color: "#D8C9E8" },
  { id: "a4", title: "Learn a new hairstyle from a tutorial", icon: "scissors-cutting", category: "Beauty", duration: "45 min", color: "#FBE4EC" },
  { id: "a5", title: "Go for a long walk and take photos", icon: "camera-outline", category: "Outdoors", duration: "1 hr", color: "#D5ECD4" },
  { id: "a6", title: "Cook or bake something new", icon: "chef-hat", category: "Cooking", duration: "1 hr", color: "#FDEBD0" },
  { id: "a7", title: "Read a book for 30 minutes", icon: "book-open-variant", category: "Learning", duration: "30 min", color: "#C9DFF7" },
  { id: "a8", title: "Reorganize and clean your wardrobe", icon: "hanger", category: "Home", duration: "2 hrs", color: "#FBE4EC" },
  { id: "a9", title: "Learn 10 words in a new language", icon: "translate", category: "Learning", duration: "30 min", color: "#D8C9E8" },
  { id: "a10", title: "Do a 20-minute yoga session", icon: "yoga", category: "Fitness", duration: "20 min", color: "#D5ECD4" },
  { id: "a11", title: "Start a journal or bullet journal", icon: "notebook-edit-outline", category: "Creativity", duration: "45 min", color: "#F7C9D9" },
  { id: "a12", title: "Make a playlist for every mood", icon: "music-note", category: "Music", duration: "1 hr", color: "#D8C9E8" },
  { id: "a13", title: "Draw or sketch something", icon: "pencil-ruler", category: "Creativity", duration: "1 hr", color: "#FDEBD0" },
  { id: "a14", title: "Watch a documentary", icon: "television-play", category: "Learning", duration: "1 hr", color: "#C9DFF7" },
  { id: "a15", title: "Write your top 100 dreams list", icon: "star-outline", category: "Reflection", duration: "1 hr", color: "#F7C9D9" },
  { id: "a16", title: "Learn a new card game", icon: "cards-playing", category: "Games", duration: "30 min", color: "#FBE4EC" },
  { id: "a17", title: "Try a new skincare face mask", icon: "face-woman-shimmer-outline", category: "Beauty", duration: "30 min", color: "#F7C9D9" },
  { id: "a18", title: "Write poetry or short stories", icon: "typewriter", category: "Creativity", duration: "1 hr", color: "#D8C9E8" },
  { id: "a19", title: "Deep clean your desk or workspace", icon: "broom", category: "Home", duration: "45 min", color: "#FBE4EC" },
  { id: "a20", title: "Call or visit a grandparent", icon: "phone-outline", category: "Connection", duration: "30 min", color: "#FDEBD0" },
  { id: "a21", title: "Learn origami with paper", icon: "star-four-points-outline", category: "Creativity", duration: "45 min", color: "#D5ECD4" },
  { id: "a22", title: "Do a puzzle (100+ pieces)", icon: "puzzle-outline", category: "Games", duration: "2 hrs", color: "#C9DFF7" },
  { id: "a23", title: "Meal prep healthy snacks", icon: "food-apple-outline", category: "Cooking", duration: "1 hr", color: "#D5ECD4" },
  { id: "a24", title: "Create a study-with-me playlist", icon: "playlist-music", category: "Study", duration: "30 min", color: "#D8C9E8" },
  { id: "a25", title: "Paint your nails with a fun design", icon: "nail", category: "Beauty", duration: "45 min", color: "#F7C9D9" },
  { id: "a26", title: "Learn to meditate (5 min)", icon: "meditation", category: "Wellness", duration: "15 min", color: "#D8C9E8" },
  { id: "a27", title: "Sort through old photos and create an album", icon: "image-outline", category: "Memories", duration: "1 hr", color: "#FDEBD0" },
  { id: "a28", title: "Write down your personal values", icon: "heart-outline", category: "Reflection", duration: "30 min", color: "#F7C9D9" },
  { id: "a29", title: "Try a new craft (crochet, knitting, calligraphy)", icon: "scissors-cutting", category: "Creativity", duration: "2 hrs", color: "#FBE4EC" },
  { id: "a30", title: "Research a place you want to visit", icon: "earth", category: "Dreams", duration: "45 min", color: "#C9DFF7" },
];

export const DETOX_CHALLENGES = [
  {
    id: "3day",
    title: "3-Day Reset",
    description: "Reduce your phone use for 3 days",
    days: 3,
    color: "#F7C9D9",
    rules: [
      "No phone for the first 30 minutes after waking",
      "No phone during meals",
      "Phone off 1 hour before bed",
      "Replace 1 hour of scrolling with an offline activity",
    ],
  },
  {
    id: "7day",
    title: "7-Day Challenge",
    description: "A full week of mindful phone use",
    days: 7,
    color: "#C88AA0",
    rules: [
      "Daily screen time under 2 hours (social only)",
      "No phone in the bedroom after 9 PM",
      "No phone during any meal",
      "One completely phone-free afternoon per week",
      "Replace scrolling with a book, walk, or creative activity",
    ],
  },
];
