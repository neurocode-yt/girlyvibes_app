export interface DayTask {
  id: string;
  title: string;
  category: string;
}

export interface PlanDay {
  day: number;
  theme: string;
  tasks: DayTask[];
}

export interface GlowUpPlan {
  id: string;
  title: string;
  subtitle: string;
  duration: number;
  color: string;
  gradient: [string, string];
  tagline: string;
  days: PlanDay[];
}

export const GLOW_UP_PLANS: GlowUpPlan[] = [
  {
    id: "7day",
    title: "7-Day Kickstart",
    subtitle: "Quick wins for a fresh you",
    duration: 7,
    color: "#F7C9D9",
    gradient: ["#FBE4EC", "#F7C9D9"],
    tagline: "Start small. Feel the shift.",
    days: [
      {
        day: 1, theme: "Hydration Day",
        tasks: [
          { id: "7-1-1", title: "Drink 8 glasses of water", category: "Health" },
          { id: "7-1-2", title: "No sugary drinks today", category: "Nutrition" },
          { id: "7-1-3", title: "Full skincare routine", category: "Beauty" },
        ],
      },
      {
        day: 2, theme: "Move Your Body",
        tasks: [
          { id: "7-2-1", title: "15-min walk or dance session", category: "Fitness" },
          { id: "7-2-2", title: "Stretch for 5 minutes", category: "Fitness" },
          { id: "7-2-3", title: "Stand up every hour", category: "Health" },
        ],
      },
      {
        day: 3, theme: "Mindset Reset",
        tasks: [
          { id: "7-3-1", title: "Write 3 things you love about yourself", category: "Mindset" },
          { id: "7-3-2", title: "No negative self-talk today", category: "Mindset" },
          { id: "7-3-3", title: "Listen to a motivating podcast or playlist", category: "Inspiration" },
        ],
      },
      {
        day: 4, theme: "Room Reset",
        tasks: [
          { id: "7-4-1", title: "Tidy your bedroom", category: "Environment" },
          { id: "7-4-2", title: "Delete unnecessary apps or photos", category: "Digital" },
          { id: "7-4-3", title: "Organize your school bag", category: "Productivity" },
        ],
      },
      {
        day: 5, theme: "Sleep Priority",
        tasks: [
          { id: "7-5-1", title: "Phone off by 9:30 PM", category: "Sleep" },
          { id: "7-5-2", title: "Try journaling before bed", category: "Wellbeing" },
          { id: "7-5-3", title: "Aim for 8 hours of sleep", category: "Health" },
        ],
      },
      {
        day: 6, theme: "Nourish Day",
        tasks: [
          { id: "7-6-1", title: "Eat at least 2 fruits or vegetables", category: "Nutrition" },
          { id: "7-6-2", title: "Cook or help cook a meal", category: "Life Skills" },
          { id: "7-6-3", title: "Everything shower routine", category: "Beauty" },
        ],
      },
      {
        day: 7, theme: "Reflection & Celebrate",
        tasks: [
          { id: "7-7-1", title: "Write what changed this week", category: "Reflection" },
          { id: "7-7-2", title: "Celebrate your progress — you did it!", category: "Mindset" },
          { id: "7-7-3", title: "Set one goal for next week", category: "Growth" },
        ],
      },
    ],
  },
  {
    id: "14day",
    title: "14-Day Reset",
    subtitle: "Build habits that last",
    duration: 14,
    color: "#C88AA0",
    gradient: ["#F7C9D9", "#C88AA0"],
    tagline: "Two weeks to a better you.",
    days: [
      {
        day: 1, theme: "Foundation Day",
        tasks: [
          { id: "14-1-1", title: "Set your 3 main goals for this reset", category: "Mindset" },
          { id: "14-1-2", title: "Morning skincare routine", category: "Beauty" },
          { id: "14-1-3", title: "Drink 8 glasses of water", category: "Health" },
        ],
      },
      {
        day: 2, theme: "Morning Power",
        tasks: [
          { id: "14-2-1", title: "Wake up 30 min earlier than usual", category: "Habits" },
          { id: "14-2-2", title: "Morning stretch or yoga", category: "Fitness" },
          { id: "14-2-3", title: "No phone for first 30 min", category: "Digital" },
        ],
      },
      {
        day: 3, theme: "Skin Love",
        tasks: [
          { id: "14-3-1", title: "Double cleanse at night", category: "Beauty" },
          { id: "14-3-2", title: "Apply sunscreen before going out", category: "Beauty" },
          { id: "14-3-3", title: "Drink extra water for skin glow", category: "Health" },
        ],
      },
      {
        day: 4, theme: "Study Reset",
        tasks: [
          { id: "14-4-1", title: "Organize your notes from this week", category: "Study" },
          { id: "14-4-2", title: "Study for 30 min with no distractions", category: "Study" },
          { id: "14-4-3", title: "Write down upcoming deadlines", category: "Productivity" },
        ],
      },
      {
        day: 5, theme: "Move & Groove",
        tasks: [
          { id: "14-5-1", title: "20-min workout or dance", category: "Fitness" },
          { id: "14-5-2", title: "Walk instead of ride if possible", category: "Fitness" },
          { id: "14-5-3", title: "Stretch before sleep", category: "Health" },
        ],
      },
      {
        day: 6, theme: "Digital Detox",
        tasks: [
          { id: "14-6-1", title: "Screen-free hour in the afternoon", category: "Digital" },
          { id: "14-6-2", title: "Read or draw instead of scroll", category: "Hobbies" },
          { id: "14-6-3", title: "Check screen time app & notice patterns", category: "Awareness" },
        ],
      },
      {
        day: 7, theme: "Week 1 Check-In",
        tasks: [
          { id: "14-7-1", title: "Journal about this week", category: "Reflection" },
          { id: "14-7-2", title: "Notice 3 positive changes", category: "Mindset" },
          { id: "14-7-3", title: "Plan week 2 intentions", category: "Growth" },
        ],
      },
      {
        day: 8, theme: "Confidence Boost",
        tasks: [
          { id: "14-8-1", title: "Wear something that makes you feel great", category: "Confidence" },
          { id: "14-8-2", title: "Compliment yourself in the mirror", category: "Mindset" },
          { id: "14-8-3", title: "Do one thing that scares you a little", category: "Growth" },
        ],
      },
      {
        day: 9, theme: "Nutrition Focus",
        tasks: [
          { id: "14-9-1", title: "Eat a nutritious breakfast", category: "Nutrition" },
          { id: "14-9-2", title: "Swap one snack for fruit or nuts", category: "Nutrition" },
          { id: "14-9-3", title: "No skipping meals today", category: "Health" },
        ],
      },
      {
        day: 10, theme: "Social & Connection",
        tasks: [
          { id: "14-10-1", title: "Reach out to a friend or family member", category: "Social" },
          { id: "14-10-2", title: "Do something kind for someone", category: "Kindness" },
          { id: "14-10-3", title: "Put your phone away during meals", category: "Connection" },
        ],
      },
      {
        day: 11, theme: "Deep Clean Day",
        tasks: [
          { id: "14-11-1", title: "Clean and organize your space", category: "Environment" },
          { id: "14-11-2", title: "Wash your bedsheets", category: "Hygiene" },
          { id: "14-11-3", title: "Wash makeup brushes or tools", category: "Beauty" },
        ],
      },
      {
        day: 12, theme: "Creativity & Joy",
        tasks: [
          { id: "14-12-1", title: "Do something creative for 30 min", category: "Hobbies" },
          { id: "14-12-2", title: "Listen to music and let yourself feel it", category: "Wellbeing" },
          { id: "14-12-3", title: "Write 10 things that make you happy", category: "Mindset" },
        ],
      },
      {
        day: 13, theme: "Full Body Care",
        tasks: [
          { id: "14-13-1", title: "Everything shower", category: "Beauty" },
          { id: "14-13-2", title: "Trim and file nails", category: "Hygiene" },
          { id: "14-13-3", title: "Self-massage or face massage", category: "Wellness" },
        ],
      },
      {
        day: 14, theme: "Glow Revealed",
        tasks: [
          { id: "14-14-1", title: "Write your glow up story from day 1 to now", category: "Reflection" },
          { id: "14-14-2", title: "Take a moment to be proud of yourself", category: "Mindset" },
          { id: "14-14-3", title: "Set your next 14-day challenge", category: "Growth" },
        ],
      },
    ],
  },
  {
    id: "30day",
    title: "30-Day Transform",
    subtitle: "A full month of becoming her",
    duration: 30,
    color: "#6B4B5C",
    gradient: ["#C88AA0", "#6B4B5C"],
    tagline: "This is your biggest glow up.",
    days: Array.from({ length: 30 }, (_, i) => {
      const themes = [
        "New Beginning", "Hydration Habits", "Skincare Essentials", "Move Your Body",
        "Mindset Work", "Study Skills", "Digital Wellness", "Week 1 Review",
        "Sleep Mastery", "Nutrition Day", "Confidence Building", "Social Connections",
        "Creative Expression", "Gratitude Practice", "Physical Refresh", "Week 2 Review",
        "Deeper Habits", "Room & Space", "Emotional Check-In", "Learning & Growth",
        "Kindness Week", "Beauty Rituals", "Focus & Flow", "Week 3 Review",
        "Celebration Mode", "Big Picture Goals", "Legacy Habits", "Final Week",
        "Reflection Deep Dive", "Your New Normal",
      ];
      const taskSets: DayTask[][] = [
        [{ id: `30-${i+1}-1`, title: "Write your transformation goals", category: "Mindset" }, { id: `30-${i+1}-2`, title: "Morning skincare routine", category: "Beauty" }, { id: `30-${i+1}-3`, title: "Drink 8 glasses of water", category: "Health" }],
        [{ id: `30-${i+1}-1`, title: "Track water intake all day", category: "Health" }, { id: `30-${i+1}-2`, title: "Replace 1 sugary drink with water", category: "Nutrition" }, { id: `30-${i+1}-3`, title: "Moisturize hands & body", category: "Beauty" }],
        [{ id: `30-${i+1}-1`, title: "Double cleanse tonight", category: "Beauty" }, { id: `30-${i+1}-2`, title: "Apply SPF before going out", category: "Beauty" }, { id: `30-${i+1}-3`, title: "Research one new skincare ingredient", category: "Beauty" }],
        [{ id: `30-${i+1}-1`, title: "20-minute movement session", category: "Fitness" }, { id: `30-${i+1}-2`, title: "Take a longer walk today", category: "Fitness" }, { id: `30-${i+1}-3`, title: "5-min morning stretch", category: "Health" }],
        [{ id: `30-${i+1}-1`, title: "Write 5 things you love about yourself", category: "Mindset" }, { id: `30-${i+1}-2`, title: "Say no to something that drains you", category: "Boundaries" }, { id: `30-${i+1}-3`, title: "Read something inspiring", category: "Growth" }],
        [{ id: `30-${i+1}-1`, title: "Plan your study schedule", category: "Study" }, { id: `30-${i+1}-2`, title: "Study for 45 min focused", category: "Study" }, { id: `30-${i+1}-3`, title: "Review yesterday's notes", category: "Study" }],
        [{ id: `30-${i+1}-1`, title: "Track screen time today", category: "Digital" }, { id: `30-${i+1}-2`, title: "No phone during meals", category: "Mindfulness" }, { id: `30-${i+1}-3`, title: "1 hour offline activity", category: "Hobbies" }],
        [{ id: `30-${i+1}-1`, title: "Weekly reflection journal", category: "Reflection" }, { id: `30-${i+1}-2`, title: "Celebrate your week 1 wins", category: "Mindset" }, { id: `30-${i+1}-3`, title: "Rest and recharge", category: "Wellness" }],
      ];
      const taskIndex = Math.min(i, taskSets.length - 1);
      return {
        day: i + 1,
        theme: themes[i],
        tasks: taskSets[taskIndex % taskSets.length],
      };
    }),
  },
];
