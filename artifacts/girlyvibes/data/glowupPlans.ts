export interface DayTask {
  id: string;
  title: string;
  titleEn: string;
  category: string;
  categoryEn: string;
}

export interface PlanDay {
  day: number;
  theme: string;
  themeEn: string;
  tasks: DayTask[];
}

export interface GlowUpPlan {
  id: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  duration: number;
  color: string;
  gradient: [string, string];
  tagline: string;
  taglineEn: string;
  days: PlanDay[];
}

export const GLOW_UP_PLANS: GlowUpPlan[] = [
  {
    id: "7day",
    title: "انطلاق ٧ أيام",
    titleEn: "7-Day Kickstart",
    subtitle: "انتصارات سريعة لنسخة جديدة منك",
    subtitleEn: "Quick wins for a new you",
    duration: 7,
    color: "#F7C9D9",
    gradient: ["#FBE4EC", "#F7C9D9"],
    tagline: "ابدئي بصغير. اشعري بالفرق.",
    taglineEn: "Start small. Feel the shift.",
    days: [
      {
        day: 1, theme: "يوم الترطيب", themeEn: "Hydration Day",
        tasks: [
          { id: "7-1-1", title: "اشربي ٨ أكواب ماء", titleEn: "Drink 8 glasses of water", category: "الصحة", categoryEn: "Health" },
          { id: "7-1-2", title: "لا مشروبات محلّاة اليوم", titleEn: "No sugary drinks today", category: "التغذية", categoryEn: "Nutrition" },
          { id: "7-1-3", title: "روتين العناية بالبشرة الكامل", titleEn: "Full skincare routine", category: "الجمال", categoryEn: "Beauty" },
        ],
      },
      {
        day: 2, theme: "حرّكي جسمك", themeEn: "Move Your Body",
        tasks: [
          { id: "7-2-1", title: "مشي أو رقص ١٥ دقيقة", titleEn: "15-min walk or dance session", category: "اللياقة", categoryEn: "Fitness" },
          { id: "7-2-2", title: "إطالة لمدة ٥ دقائق", titleEn: "Stretch for 5 minutes", category: "اللياقة", categoryEn: "Fitness" },
          { id: "7-2-3", title: "قفي وتحرّكي كل ساعة", titleEn: "Stand up every hour", category: "الصحة", categoryEn: "Health" },
        ],
      },
      {
        day: 3, theme: "إعادة ضبط العقل", themeEn: "Mindset Reset",
        tasks: [
          { id: "7-3-1", title: "اكتبي ٣ أشياء تحبّينها في نفسك", titleEn: "Write 3 things you love about yourself", category: "الذهنية", categoryEn: "Mindset" },
          { id: "7-3-2", title: "لا حديث سلبي مع نفسك اليوم", titleEn: "No negative self-talk today", category: "الذهنية", categoryEn: "Mindset" },
          { id: "7-3-3", title: "استمعي لبودكاست أو قائمة محفّزة", titleEn: "Listen to a motivating podcast or playlist", category: "الإلهام", categoryEn: "Inspiration" },
        ],
      },
      {
        day: 4, theme: "ترتيب الغرفة", themeEn: "Room Reset",
        tasks: [
          { id: "7-4-1", title: "رتّبي غرفة نومك", titleEn: "Tidy your bedroom", category: "البيئة", categoryEn: "Environment" },
          { id: "7-4-2", title: "احذفي تطبيقات وصور غير ضرورية", titleEn: "Delete unnecessary apps or photos", category: "الرقمي", categoryEn: "Digital" },
          { id: "7-4-3", title: "نظّمي حقيبة مدرستك", titleEn: "Organize your school bag", category: "الإنتاجية", categoryEn: "Productivity" },
        ],
      },
      {
        day: 5, theme: "أولوية النوم", themeEn: "Sleep Priority",
        tasks: [
          { id: "7-5-1", title: "أطفئي الهاتف قبل ٩:٣٠ مساءً", titleEn: "Phone off by 9:30 PM", category: "النوم", categoryEn: "Sleep" },
          { id: "7-5-2", title: "جرّبي الكتابة في يومياتك قبل النوم", titleEn: "Try journaling before bed", category: "الصحة النفسية", categoryEn: "Wellbeing" },
          { id: "7-5-3", title: "احرصي على ٨ ساعات نوم", titleEn: "Aim for 8 hours of sleep", category: "الصحة", categoryEn: "Health" },
        ],
      },
      {
        day: 6, theme: "يوم التغذية", themeEn: "Nourish Day",
        tasks: [
          { id: "7-6-1", title: "تناولي فاكهة أو خضار على الأقل", titleEn: "Eat at least 2 fruits or vegetables", category: "التغذية", categoryEn: "Nutrition" },
          { id: "7-6-2", title: "اطبخي أو ساعدي في الطبخ", titleEn: "Cook or help cook a meal", category: "مهارات الحياة", categoryEn: "Life Skills" },
          { id: "7-6-3", title: "حمام الاهتمام الكامل", titleEn: "Everything shower routine", category: "الجمال", categoryEn: "Beauty" },
        ],
      },
      {
        day: 7, theme: "تأمّل واحتفلي", themeEn: "Reflection & Celebrate",
        tasks: [
          { id: "7-7-1", title: "اكتبي ما تغيّر هذا الأسبوع", titleEn: "Write what changed this week", category: "التأمل", categoryEn: "Reflection" },
          { id: "7-7-2", title: "احتفلي بتقدّمك — فعلتِها!", titleEn: "Celebrate your progress — you did it!", category: "الذهنية", categoryEn: "Mindset" },
          { id: "7-7-3", title: "ضعي هدفاً واحداً للأسبوع القادم", titleEn: "Set one goal for next week", category: "النمو", categoryEn: "Growth" },
        ],
      },
    ],
  },
  {
    id: "14day",
    title: "ريست ١٤ يوم",
    titleEn: "14-Day Reset",
    subtitle: "ابني عادات تدوم",
    subtitleEn: "Build habits that stick",
    duration: 14,
    color: "#C88AA0",
    gradient: ["#F7C9D9", "#C88AA0"],
    tagline: "أسبوعان نحو نسخة أفضل منك.",
    taglineEn: "Two weeks to a better you.",
    days: [
      {
        day: 1, theme: "يوم الأساس", themeEn: "Foundation Day",
        tasks: [
          { id: "14-1-1", title: "حدّدي ٣ أهداف رئيسية لهذا الريست", titleEn: "Set your 3 main goals for this reset", category: "الذهنية", categoryEn: "Mindset" },
          { id: "14-1-2", title: "روتين العناية بالبشرة صباحاً", titleEn: "Morning skincare routine", category: "الجمال", categoryEn: "Beauty" },
          { id: "14-1-3", title: "اشربي ٨ أكواب ماء", titleEn: "Drink 8 glasses of water", category: "الصحة", categoryEn: "Health" },
        ],
      },
      {
        day: 2, theme: "قوة الصباح", themeEn: "Morning Power",
        tasks: [
          { id: "14-2-1", title: "استيقظي ٣٠ دقيقة أبكر من المعتاد", titleEn: "Wake up 30 min earlier than usual", category: "العادات", categoryEn: "Habits" },
          { id: "14-2-2", title: "إطالة أو يوغا صباحية", titleEn: "Morning stretch or yoga", category: "اللياقة", categoryEn: "Fitness" },
          { id: "14-2-3", title: "لا هاتف في أول ٣٠ دقيقة", titleEn: "No phone for first 30 min", category: "الرقمي", categoryEn: "Digital" },
        ],
      },
      {
        day: 3, theme: "حبّ البشرة", themeEn: "Skin Love",
        tasks: [
          { id: "14-3-1", title: "تنظيف مضاعف مساءً", titleEn: "Double cleanse at night", category: "الجمال", categoryEn: "Beauty" },
          { id: "14-3-2", title: "ضعي واقي الشمس قبل الخروج", titleEn: "Apply sunscreen before going out", category: "الجمال", categoryEn: "Beauty" },
          { id: "14-3-3", title: "اشربي ماء إضافياً لتوهج البشرة", titleEn: "Drink extra water for skin glow", category: "الصحة", categoryEn: "Health" },
        ],
      },
      {
        day: 4, theme: "إعادة ضبط الدراسة", themeEn: "Study Reset",
        tasks: [
          { id: "14-4-1", title: "نظّمي ملاحظاتك من هذا الأسبوع", titleEn: "Organize your notes from this week", category: "الدراسة", categoryEn: "Study" },
          { id: "14-4-2", title: "ادرسي ٣٠ دقيقة بدون تشتيت", titleEn: "Study for 30 min with no distractions", category: "الدراسة", categoryEn: "Study" },
          { id: "14-4-3", title: "اكتبي المواعيد النهائية القادمة", titleEn: "Write down upcoming deadlines", category: "الإنتاجية", categoryEn: "Productivity" },
        ],
      },
      {
        day: 5, theme: "تحرّكي واستمتعي", themeEn: "Move & Groove",
        tasks: [
          { id: "14-5-1", title: "تمرين أو رقص ٢٠ دقيقة", titleEn: "20-min workout or dance", category: "اللياقة", categoryEn: "Fitness" },
          { id: "14-5-2", title: "امشي بدل ركوب السيارة إن أمكن", titleEn: "Walk instead of ride if possible", category: "اللياقة", categoryEn: "Fitness" },
          { id: "14-5-3", title: "إطالة قبل النوم", titleEn: "Stretch before sleep", category: "الصحة", categoryEn: "Health" },
        ],
      },
      {
        day: 6, theme: "ديتوكس رقمي", themeEn: "Digital Detox",
        tasks: [
          { id: "14-6-1", title: "ساعة بدون شاشات بعد الظهر", titleEn: "Screen-free hour in the afternoon", category: "الرقمي", categoryEn: "Digital" },
          { id: "14-6-2", title: "اقرئي أو ارسمي بدل التصفح", titleEn: "Read or draw instead of scroll", category: "الهوايات", categoryEn: "Hobbies" },
          { id: "14-6-3", title: "راجعي وقت الشاشة ولاحظي الأنماط", titleEn: "Check screen time app & notice patterns", category: "الوعي", categoryEn: "Awareness" },
        ],
      },
      {
        day: 7, theme: "مراجعة الأسبوع الأول", themeEn: "Week 1 Check-In",
        tasks: [
          { id: "14-7-1", title: "اكتبي في يومياتك عن هذا الأسبوع", titleEn: "Journal about this week", category: "التأمل", categoryEn: "Reflection" },
          { id: "14-7-2", title: "لاحظي ٣ تغييرات إيجابية", titleEn: "Notice 3 positive changes", category: "الذهنية", categoryEn: "Mindset" },
          { id: "14-7-3", title: "خططي لنوايا الأسبوع الثاني", titleEn: "Plan week 2 intentions", category: "النمو", categoryEn: "Growth" },
        ],
      },
      {
        day: 8, theme: "تعزيز الثقة", themeEn: "Confidence Boost",
        tasks: [
          { id: "14-8-1", title: "ارتدي شيئاً يجعلك تشعرين بالروعة", titleEn: "Wear something that makes you feel great", category: "الثقة", categoryEn: "Confidence" },
          { id: "14-8-2", title: "امدحي نفسك أمام المرآة", titleEn: "Compliment yourself in the mirror", category: "الذهنية", categoryEn: "Mindset" },
          { id: "14-8-3", title: "افعلي شيئاً يخيفك قليلاً", titleEn: "Do one thing that scares you a little", category: "النمو", categoryEn: "Growth" },
        ],
      },
      {
        day: 9, theme: "التركيز على التغذية", themeEn: "Nutrition Focus",
        tasks: [
          { id: "14-9-1", title: "تناولي إفطاراً مغذياً", titleEn: "Eat a nutritious breakfast", category: "التغذية", categoryEn: "Nutrition" },
          { id: "14-9-2", title: "استبدلي وجبة خفيفة بفاكهة أو مكسرات", titleEn: "Swap one snack for fruit or nuts", category: "التغذية", categoryEn: "Nutrition" },
          { id: "14-9-3", title: "لا تتخطّي أي وجبة اليوم", titleEn: "No skipping meals today", category: "الصحة", categoryEn: "Health" },
        ],
      },
      {
        day: 10, theme: "التواصل الاجتماعي", themeEn: "Social & Connection",
        tasks: [
          { id: "14-10-1", title: "تواصلي مع صديقة أو فرد من العائلة", titleEn: "Reach out to a friend or family member", category: "التواصل", categoryEn: "Social" },
          { id: "14-10-2", title: "افعلي شيئاً لطيفاً لشخص ما", titleEn: "Do something kind for someone", category: "اللطف", categoryEn: "Kindness" },
          { id: "14-10-3", title: "ضعي هاتفك جانباً أثناء الوجبات", titleEn: "Put your phone away during meals", category: "الانتباه", categoryEn: "Connection" },
        ],
      },
      {
        day: 11, theme: "يوم التنظيف العميق", themeEn: "Deep Clean Day",
        tasks: [
          { id: "14-11-1", title: "نظّفي ورتّبي مساحتك", titleEn: "Clean and organize your space", category: "البيئة", categoryEn: "Environment" },
          { id: "14-11-2", title: "اغسلي ملاءات سريرك", titleEn: "Wash your bedsheets", category: "النظافة", categoryEn: "Hygiene" },
          { id: "14-11-3", title: "نظّفي فرش المكياج أو أدواتك", titleEn: "Wash makeup brushes or tools", category: "الجمال", categoryEn: "Beauty" },
        ],
      },
      {
        day: 12, theme: "الإبداع والفرح", themeEn: "Creativity & Joy",
        tasks: [
          { id: "14-12-1", title: "افعلي شيئاً إبداعياً ٣٠ دقيقة", titleEn: "Do something creative for 30 min", category: "الهوايات", categoryEn: "Hobbies" },
          { id: "14-12-2", title: "استمعي لموسيقى ودعيها تلمس مشاعرك", titleEn: "Listen to music and let yourself feel it", category: "الصحة النفسية", categoryEn: "Wellbeing" },
          { id: "14-12-3", title: "اكتبي ١٠ أشياء تجعلك سعيدة", titleEn: "Write 10 things that make you happy", category: "الذهنية", categoryEn: "Mindset" },
        ],
      },
      {
        day: 13, theme: "العناية الكاملة بالجسم", themeEn: "Full Body Care",
        tasks: [
          { id: "14-13-1", title: "حمام الاهتمام الكامل", titleEn: "Everything shower", category: "الجمال", categoryEn: "Beauty" },
          { id: "14-13-2", title: "قصّي وبرّدي أظافرك", titleEn: "Trim and file nails", category: "النظافة", categoryEn: "Hygiene" },
          { id: "14-13-3", title: "تدليك الجسم أو الوجه", titleEn: "Self-massage or face massage", category: "العافية", categoryEn: "Wellness" },
        ],
      },
      {
        day: 14, theme: "تجلّى التوهج", themeEn: "Glow Revealed",
        tasks: [
          { id: "14-14-1", title: "اكتبي قصة تحوّلك من اليوم الأول حتى الآن", titleEn: "Write your glow up story from day 1 to now", category: "التأمل", categoryEn: "Reflection" },
          { id: "14-14-2", title: "خذي لحظة لتفخري بنفسك", titleEn: "Take a moment to be proud of yourself", category: "الذهنية", categoryEn: "Mindset" },
          { id: "14-14-3", title: "ضعي تحدي الـ١٤ يوم القادم", titleEn: "Set your next 14-day challenge", category: "النمو", categoryEn: "Growth" },
        ],
      },
    ],
  },
  {
    id: "30day",
    title: "تحول ٣٠ يوم",
    titleEn: "30-Day Transformation",
    subtitle: "شهر كامل لتصبحي هي",
    subtitleEn: "A full month to become her",
    duration: 30,
    color: "#6B4B5C",
    gradient: ["#C88AA0", "#6B4B5C"],
    tagline: "هذا هو أكبر جلو أب لك.",
    taglineEn: "This is your biggest glow up.",
    days: Array.from({ length: 30 }, (_, i) => {
      const themes = [
        "بداية جديدة", "عادات الترطيب", "أساسيات البشرة", "حرّكي جسمك",
        "عمل الذهنية", "مهارات الدراسة", "الصحة الرقمية", "مراجعة الأسبوع الأول",
        "إتقان النوم", "يوم التغذية", "بناء الثقة", "التواصل الاجتماعي",
        "التعبير الإبداعي", "ممارسة الامتنان", "تجديد الجسم", "مراجعة الأسبوع الثاني",
        "عادات أعمق", "المساحة والغرفة", "المراجعة العاطفية", "التعلم والنمو",
        "أسبوع اللطف", "طقوس الجمال", "التركيز والتدفق", "مراجعة الأسبوع الثالث",
        "وضع الاحتفال", "أهداف كبيرة", "عادات دائمة", "الأسبوع الأخير",
        "التأمل العميق", "طبيعتك الجديدة",
      ];
      const themesEn = [
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
        [{ id: `30-${i+1}-1`, title: "اكتبي أهداف تحوّلك", titleEn: "Write your transformation goals", category: "الذهنية", categoryEn: "Mindset" }, { id: `30-${i+1}-2`, title: "روتين العناية بالبشرة صباحاً", titleEn: "Morning skincare routine", category: "الجمال", categoryEn: "Beauty" }, { id: `30-${i+1}-3`, title: "اشربي ٨ أكواب ماء", titleEn: "Drink 8 glasses of water", category: "الصحة", categoryEn: "Health" }],
        [{ id: `30-${i+1}-1`, title: "تتبّعي شرب الماء طوال اليوم", titleEn: "Track water intake all day", category: "الصحة", categoryEn: "Health" }, { id: `30-${i+1}-2`, title: "استبدلي مشروباً محلّى بالماء", titleEn: "Replace 1 sugary drink with water", category: "التغذية", categoryEn: "Nutrition" }, { id: `30-${i+1}-3`, title: "رطّبي يديك وجسمك", titleEn: "Moisturize hands & body", category: "الجمال", categoryEn: "Beauty" }],
        [{ id: `30-${i+1}-1`, title: "تنظيف مضاعف الليلة", titleEn: "Double cleanse tonight", category: "الجمال", categoryEn: "Beauty" }, { id: `30-${i+1}-2`, title: "ضعي واقي الشمس قبل الخروج", titleEn: "Apply SPF before going out", category: "الجمال", categoryEn: "Beauty" }, { id: `30-${i+1}-3`, title: "ابحثي عن مكوّن عناية جديد", titleEn: "Research one new skincare ingredient", category: "الجمال", categoryEn: "Beauty" }],
        [{ id: `30-${i+1}-1`, title: "جلسة حركة ٢٠ دقيقة", titleEn: "20-minute movement session", category: "اللياقة", categoryEn: "Fitness" }, { id: `30-${i+1}-2`, title: "خذي مشية أطول اليوم", titleEn: "Take a longer walk today", category: "اللياقة", categoryEn: "Fitness" }, { id: `30-${i+1}-3`, title: "إطالة صباحية ٥ دقائق", titleEn: "5-min morning stretch", category: "الصحة", categoryEn: "Health" }],
        [{ id: `30-${i+1}-1`, title: "اكتبي ٥ أشياء تحبّينها في نفسك", titleEn: "Write 5 things you love about yourself", category: "الذهنية", categoryEn: "Mindset" }, { id: `30-${i+1}-2`, title: "قولي لا لشيء يُنهكك", titleEn: "Say no to something that drains you", category: "الحدود", categoryEn: "Boundaries" }, { id: `30-${i+1}-3`, title: "اقرئي شيئاً ملهماً", titleEn: "Read something inspiring", category: "النمو", categoryEn: "Growth" }],
        [{ id: `30-${i+1}-1`, title: "خططي لجدول دراستك", titleEn: "Plan your study schedule", category: "الدراسة", categoryEn: "Study" }, { id: `30-${i+1}-2`, title: "ادرسي ٤٥ دقيقة بتركيز كامل", titleEn: "Study for 45 min focused", category: "الدراسة", categoryEn: "Study" }, { id: `30-${i+1}-3`, title: "راجعي ملاحظات الأمس", titleEn: "Review yesterday's notes", category: "الدراسة", categoryEn: "Study" }],
        [{ id: `30-${i+1}-1`, title: "تتبّعي وقت الشاشة اليوم", titleEn: "Track screen time today", category: "الرقمي", categoryEn: "Digital" }, { id: `30-${i+1}-2`, title: "لا هاتف أثناء الوجبات", titleEn: "No phone during meals", category: "الحضور الذهني", categoryEn: "Mindfulness" }, { id: `30-${i+1}-3`, title: "نشاط بدون هاتف لساعة كاملة", titleEn: "1 hour offline activity", category: "الهوايات", categoryEn: "Hobbies" }],
        [{ id: `30-${i+1}-1`, title: "يوميات التأمل الأسبوعي", titleEn: "Weekly reflection journal", category: "التأمل", categoryEn: "Reflection" }, { id: `30-${i+1}-2`, title: "احتفلي بانتصارات أسبوعك", titleEn: "Celebrate your week 1 wins", category: "الذهنية", categoryEn: "Mindset" }, { id: `30-${i+1}-3`, title: "ارتاحي وأعيدي شحن طاقتك", titleEn: "Rest and recharge", category: "العافية", categoryEn: "Wellness" }],
      ];
      const taskIndex = Math.min(i, taskSets.length - 1);
      return {
        day: i + 1,
        theme: themes[i],
        themeEn: themesEn[i],
        tasks: taskSets[taskIndex % taskSets.length],
      };
    }),
  },
];
