export const routineLabels: Record<string, { title: string; steps: Record<string, string> }> = {
  morning: {
    title: "Morning Routine",
    steps: {
      m1: "Drink a glass of water",
      m2: "Wash your face",
      m3: "Apply moisturizer",
      m4: "Brush teeth",
      m5: "Comb & style hair",
      m6: "Get dressed",
      m7: "Eat breakfast",
      m8: "Set one intention",
    },
  },
  school: {
    title: "School Routine",
    steps: {
      s1: "Pack your bag the night before",
      s2: "Review today's schedule",
      s3: "Arrive 5 minutes early",
      s4: "Drink water during class",
      s5: "Take notes actively",
      s6: "Talk to at least one person",
      s7: "Check homework list",
    },
  },
  evening: {
    title: "Evening Routine",
    steps: {
      e1: "Put away your phone",
      e2: "Remove makeup / cleanse face",
      e3: "Apply night cream or serum",
      e4: "Brush & floss teeth",
      e5: "Lay out tomorrow's outfit",
      e6: "Journal or gratitude notes",
      e7: "Read or listen to calm music",
      e8: "Lights out by 10 PM",
    },
  },
  shower: {
    title: "Everything Shower",
    steps: {
      sh1: "Dry brush skin",
      sh2: "Shampoo hair",
      sh3: "Deep condition hair",
      sh4: "Body scrub",
      sh5: "Shave if needed",
      sh6: "Rinse with cool water",
      sh7: "Rinse hair conditioner out",
      sh8: "Apply body lotion immediately",
      sh9: "Deodorant & perfume",
      sh10: "Skincare routine",
    },
  },
  hygiene: {
    title: "Hygiene Checklist",
    steps: {
      h1: "Brush teeth (morning)",
      h2: "Wash face morning & night",
      h3: "Apply SPF every morning",
      h4: "Change underwear daily",
      h5: "Deodorant every morning",
      h6: "Keep nails clean & trimmed",
      h7: "Wash hair 2-3x per week",
      h8: "Brush teeth before bed",
    },
  },
};

export const glowPlanLabels: Record<string, string> = {
  "7day": "7-Day Kickstart",
  "14day": "14-Day Glow Up",
};

export const detoxLabels: Record<string, string> = {
  "3day": "3-Day Reset",
  "7day": "7-Day Challenge",
  "14day": "14-Day Detox",
};

export function prettyId(value: string) {
  return value
    .replace(/^custom-/, "Custom routine ")
    .replace(/^step-/, "Step ")
    .replace(/[-_]+/g, " ")
    .trim();
}

export function glowTaskLabel(key: string) {
  const match = key.match(/^(.+)_d(\d+)_(.+)$/);
  if (!match) return prettyId(key);

  const [, planId, day, taskId] = match;
  return `${glowPlanLabels[planId] || prettyId(planId)} - Day ${day} - Task ${taskId}`;
}
