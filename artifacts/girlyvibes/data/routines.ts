import { MaterialCommunityIcons } from "@expo/vector-icons";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export interface RoutineStep {
  id: string;
  title: string;
  subtitle?: string;
  icon: IconName;
}

export interface RoutineTemplate {
  id: string;
  title: string;
  subtitle: string;
  emoji: IconName;
  color: string;
  steps: RoutineStep[];
}

export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    id: "morning",
    title: "روتين الصباح",
    subtitle: "ابدئي يومك بتألق",
    emoji: "weather-sunset-up",
    color: "#FDEBD0",
    steps: [
      { id: "m1", title: "Drink a glass of water", subtitle: "Hydrate right away", icon: "water" },
      { id: "m2", title: "Wash your face", subtitle: "Gentle cleanser", icon: "face-man-shimmer" },
      { id: "m3", title: "Apply moisturizer", subtitle: "SPF if going outside", icon: "lotion-plus" },
      { id: "m4", title: "Brush teeth", subtitle: "2 minutes minimum", icon: "toothbrush" },
      { id: "m5", title: "Comb & style hair", subtitle: "Look & feel put together", icon: "hair-dryer" },
      { id: "m6", title: "Get dressed", subtitle: "Outfit that makes you smile", icon: "hanger" },
      { id: "m7", title: "Eat breakfast", subtitle: "Fuel your brain", icon: "food-apple" },
      { id: "m8", title: "Set one intention", subtitle: "What's your focus today?", icon: "star-shooting" },
    ],
  },
  {
    id: "school",
    title: "روتين المدرسة",
    subtitle: "احضري بأفضل نسخة منك",
    emoji: "book-open-variant",
    color: "#D5ECD4",
    steps: [
      { id: "s1", title: "Pack your bag the night before", subtitle: "No morning panic", icon: "bag-personal" },
      { id: "s2", title: "Review today's schedule", subtitle: "Know what to expect", icon: "calendar-today" },
      { id: "s3", title: "Arrive 5 minutes early", subtitle: "Calm start = better focus", icon: "clock-outline" },
      { id: "s4", title: "Drink water during class", subtitle: "Stay alert", icon: "cup-water" },
      { id: "s5", title: "Take notes actively", subtitle: "Write key points", icon: "pencil" },
      { id: "s6", title: "Talk to at least one person", subtitle: "Connection matters", icon: "account-group" },
      { id: "s7", title: "Check homework list", subtitle: "Before leaving school", icon: "checkbox-marked-outline" },
    ],
  },
  {
    id: "evening",
    title: "روتين المساء",
    subtitle: "أنهي يومك بهدوء",
    emoji: "weather-night",
    color: "#D8C9E8",
    steps: [
      { id: "e1", title: "Put away your phone", subtitle: "1 hour before bed", icon: "cellphone-off" },
      { id: "e2", title: "Remove makeup / cleanse face", subtitle: "Never sleep with makeup", icon: "face-woman-shimmer" },
      { id: "e3", title: "Apply night cream or serum", subtitle: "Skin repairs while you sleep", icon: "bottle-tonic" },
      { id: "e4", title: "Brush & floss teeth", subtitle: "Fresh start tomorrow", icon: "toothbrush-paste" },
      { id: "e5", title: "Lay out tomorrow's outfit", subtitle: "Less stress in the morning", icon: "tshirt-crew" },
      { id: "e6", title: "Journal or gratitude notes", subtitle: "3 things you're grateful for", icon: "notebook-edit" },
      { id: "e7", title: "Read or listen to calm music", subtitle: "Ease into sleep", icon: "book-open" },
      { id: "e8", title: "Lights out by 10 PM", subtitle: "Beauty sleep is real", icon: "sleep" },
    ],
  },
  {
    id: "shower",
    title: "حمام الاهتمام الكامل",
    subtitle: "تجديد كامل من الرأس للقدم",
    emoji: "shower-head",
    color: "#C9DFF7",
    steps: [
      { id: "sh1", title: "Dry brush skin", subtitle: "Before shower for glow", icon: "brush" },
      { id: "sh2", title: "Shampoo hair", subtitle: "Massage scalp gently", icon: "shaker" },
      { id: "sh3", title: "Deep condition hair", subtitle: "Leave on while showering", icon: "hair-dryer-outline" },
      { id: "sh4", title: "Body scrub", subtitle: "Focus on elbows & knees", icon: "spa-outline" },
      { id: "sh5", title: "Shave if needed", subtitle: "Take your time", icon: "scissors-cutting" },
      { id: "sh6", title: "Rinse with cool water", subtitle: "Closes pores & seals shine", icon: "water-thermometer" },
      { id: "sh7", title: "Rinse hair conditioner out", subtitle: "Fully rinse for soft hair", icon: "waves" },
      { id: "sh8", title: "Apply body lotion immediately", subtitle: "While skin is still damp", icon: "lotion" },
      { id: "sh9", title: "Deodorant & perfume", subtitle: "Smell amazing all day", icon: "spray" },
      { id: "sh10", title: "Skincare routine", subtitle: "Toner, serum, moisturizer", icon: "face-woman" },
    ],
  },
  {
    id: "hygiene",
    title: "النظافة من الألف للياء",
    subtitle: "عادات النظافة اليومية",
    emoji: "star-four-points",
    color: "#F9D9D9",
    steps: [
      { id: "h1", title: "Brush teeth (morning)", subtitle: "2 minutes, don't rush", icon: "toothbrush" },
      { id: "h2", title: "Wash face morning & night", subtitle: "Consistent = results", icon: "water" },
      { id: "h3", title: "Apply SPF every morning", subtitle: "Even on cloudy days", icon: "weather-sunny" },
      { id: "h4", title: "Change underwear daily", subtitle: "Non-negotiable", icon: "check-circle" },
      { id: "h5", title: "Deodorant every morning", subtitle: "Before getting dressed", icon: "spray-bottle" },
      { id: "h6", title: "Keep nails clean & trimmed", subtitle: "Weekly check", icon: "hand-clap" },
      { id: "h7", title: "Wash hair 2-3x per week", subtitle: "Or as needed for your type", icon: "hair-dryer" },
      { id: "h8", title: "Brush teeth before bed", subtitle: "Most important brush", icon: "toothbrush-paste" },
    ],
  },
];
