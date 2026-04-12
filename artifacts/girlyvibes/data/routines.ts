import { MaterialCommunityIcons } from "@expo/vector-icons";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export interface RoutineStep {
  id: string;
  title: string;
  titleEn: string;
  subtitle?: string;
  subtitleEn?: string;
  icon: IconName;
}

export interface RoutineTemplate {
  id: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  emoji: IconName;
  color: string;
  steps: RoutineStep[];
}

export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    id: "morning",
    title: "روتين الصباح",
    titleEn: "Morning Routine",
    subtitle: "ابدئي يومك بتألق",
    subtitleEn: "Start your day glowing",
    emoji: "weather-sunset-up",
    color: "#FDEBD0",
    steps: [
      { id: "m1", title: "اشربي كوب ماء", titleEn: "Drink a glass of water", subtitle: "رطّبي جسمك فوراً", subtitleEn: "Hydrate right away", icon: "water" },
      { id: "m2", title: "اغسلي وجهك", titleEn: "Wash your face", subtitle: "منظّف لطيف للبشرة", subtitleEn: "Gentle cleanser", icon: "face-man-shimmer" },
      { id: "m3", title: "ضعي المرطّب", titleEn: "Apply moisturizer", subtitle: "مع واقي شمس عند الخروج", subtitleEn: "SPF if going outside", icon: "lotion-plus" },
      { id: "m4", title: "اغسلي أسنانك", titleEn: "Brush teeth", subtitle: "دقيقتان على الأقل", subtitleEn: "2 minutes minimum", icon: "toothbrush" },
      { id: "m5", title: "رتّبي شعرك", titleEn: "Comb & style hair", subtitle: "اجعلي مظهرك أنيقاً", subtitleEn: "Look & feel put together", icon: "hair-dryer" },
      { id: "m6", title: "ارتدي ملابسك", titleEn: "Get dressed", subtitle: "اختاري ما يجعلك سعيدة", subtitleEn: "Outfit that makes you smile", icon: "hanger" },
      { id: "m7", title: "تناولي الإفطار", titleEn: "Eat breakfast", subtitle: "غذّي عقلك وجسمك", subtitleEn: "Fuel your brain", icon: "food-apple" },
      { id: "m8", title: "حدّدي نيّة اليوم", titleEn: "Set one intention", subtitle: "ما هو تركيزك اليوم؟", subtitleEn: "What's your focus today?", icon: "star-shooting" },
    ],
  },
  {
    id: "school",
    title: "روتين المدرسة",
    titleEn: "School Routine",
    subtitle: "احضري بأفضل نسخة منك",
    subtitleEn: "Show up as your best self",
    emoji: "book-open-variant",
    color: "#D5ECD4",
    steps: [
      { id: "s1", title: "جهّزي حقيبتك مساءً", titleEn: "Pack your bag the night before", subtitle: "لا قلق في الصباح", subtitleEn: "No morning panic", icon: "bag-personal" },
      { id: "s2", title: "راجعي جدول اليوم", titleEn: "Review today's schedule", subtitle: "اعرفي ما ينتظرك", subtitleEn: "Know what to expect", icon: "calendar-today" },
      { id: "s3", title: "احضري مبكرة ٥ دقائق", titleEn: "Arrive 5 minutes early", subtitle: "بداية هادئة = تركيز أفضل", subtitleEn: "Calm start = better focus", icon: "clock-outline" },
      { id: "s4", title: "اشربي ماء في الحصص", titleEn: "Drink water during class", subtitle: "ابقي يقظة ومنتبهة", subtitleEn: "Stay alert", icon: "cup-water" },
      { id: "s5", title: "دوّني ملاحظات بنشاط", titleEn: "Take notes actively", subtitle: "اكتبي النقاط المهمة", subtitleEn: "Write key points", icon: "pencil" },
      { id: "s6", title: "تحدّثي مع شخص واحد", titleEn: "Talk to at least one person", subtitle: "التواصل مهم جداً", subtitleEn: "Connection matters", icon: "account-group" },
      { id: "s7", title: "راجعي قائمة الواجبات", titleEn: "Check homework list", subtitle: "قبل مغادرة المدرسة", subtitleEn: "Before leaving school", icon: "checkbox-marked-outline" },
    ],
  },
  {
    id: "evening",
    title: "روتين المساء",
    titleEn: "Evening Routine",
    subtitle: "أنهي يومك بهدوء",
    subtitleEn: "Wind down beautifully",
    emoji: "weather-night",
    color: "#D8C9E8",
    steps: [
      { id: "e1", title: "ضعي الهاتف جانباً", titleEn: "Put away your phone", subtitle: "ساعة قبل النوم", subtitleEn: "1 hour before bed", icon: "cellphone-off" },
      { id: "e2", title: "أزيلي المكياج ونظّفي وجهك", titleEn: "Remove makeup / cleanse face", subtitle: "لا تنامي بمكياج أبداً", subtitleEn: "Never sleep with makeup", icon: "face-woman-shimmer" },
      { id: "e3", title: "ضعي كريم الليل أو السيروم", titleEn: "Apply night cream or serum", subtitle: "البشرة تتجدد أثناء النوم", subtitleEn: "Skin repairs while you sleep", icon: "bottle-tonic" },
      { id: "e4", title: "فرشاة الأسنان والخيط", titleEn: "Brush & floss teeth", subtitle: "بداية جديدة نظيفة", subtitleEn: "Fresh start tomorrow", icon: "toothbrush-paste" },
      { id: "e5", title: "جهّزي ملابس الغد", titleEn: "Lay out tomorrow's outfit", subtitle: "أقل توتر في الصباح", subtitleEn: "Less stress in the morning", icon: "tshirt-crew" },
      { id: "e6", title: "يوميات أو كتابة الامتنان", titleEn: "Journal or gratitude notes", subtitle: "٣ أشياء تشكرين عليها", subtitleEn: "3 things you're grateful for", icon: "notebook-edit" },
      { id: "e7", title: "اقرئي أو استمعي لموسيقى هادئة", titleEn: "Read or listen to calm music", subtitle: "استعدّي للنوم", subtitleEn: "Ease into sleep", icon: "book-open" },
      { id: "e8", title: "أطفئي الأضواء قبل ١٠ مساءً", titleEn: "Lights out by 10 PM", subtitle: "نوم الجمال حقيقي", subtitleEn: "Beauty sleep is real", icon: "sleep" },
    ],
  },
  {
    id: "shower",
    title: "حمام الاهتمام الكامل",
    titleEn: "Everything Shower",
    subtitle: "تجديد كامل من الرأس للقدم",
    subtitleEn: "Full refresh head to toe",
    emoji: "shower-head",
    color: "#C9DFF7",
    steps: [
      { id: "sh1", title: "تدليك جاف للجلد", titleEn: "Dry brush skin", subtitle: "قبل الاستحمام للتوهج", subtitleEn: "Before shower for glow", icon: "brush" },
      { id: "sh2", title: "غسل الشعر بالشامبو", titleEn: "Shampoo hair", subtitle: "دلّكي فروة الرأس بلطف", subtitleEn: "Massage scalp gently", icon: "shaker" },
      { id: "sh3", title: "بلسم عميق للشعر", titleEn: "Deep condition hair", subtitle: "اتركيه أثناء الاستحمام", subtitleEn: "Leave on while showering", icon: "hair-dryer-outline" },
      { id: "sh4", title: "مقشّر الجسم", titleEn: "Body scrub", subtitle: "ركّزي على الكوعين والركبتين", subtitleEn: "Focus on elbows & knees", icon: "spa-outline" },
      { id: "sh5", title: "إزالة الشعر عند الحاجة", titleEn: "Shave if needed", subtitle: "خذي وقتك", subtitleEn: "Take your time", icon: "scissors-cutting" },
      { id: "sh6", title: "شطف بالماء البارد", titleEn: "Rinse with cool water", subtitle: "يغلق المسام ويختم اللمعان", subtitleEn: "Closes pores & seals shine", icon: "water-thermometer" },
      { id: "sh7", title: "شطف البلسم جيداً", titleEn: "Rinse hair conditioner out", subtitle: "شطف كامل لشعر ناعم", subtitleEn: "Fully rinse for soft hair", icon: "waves" },
      { id: "sh8", title: "ضعي مرطّب الجسم فوراً", titleEn: "Apply body lotion immediately", subtitle: "والجلد لا يزال رطباً", subtitleEn: "While skin is still damp", icon: "lotion" },
      { id: "sh9", title: "مزيل عرق وعطر", titleEn: "Deodorant & perfume", subtitle: "رائحة رائعة طوال اليوم", subtitleEn: "Smell amazing all day", icon: "spray" },
      { id: "sh10", title: "روتين العناية بالبشرة", titleEn: "Skincare routine", subtitle: "تونر، سيروم، مرطّب", subtitleEn: "Toner, serum, moisturizer", icon: "face-woman" },
    ],
  },
  {
    id: "hygiene",
    title: "النظافة من الألف للياء",
    titleEn: "Hygiene Checklist",
    subtitle: "عادات النظافة اليومية",
    subtitleEn: "Daily hygiene habits",
    emoji: "star-four-points",
    color: "#F9D9D9",
    steps: [
      { id: "h1", title: "تنظيف الأسنان صباحاً", titleEn: "Brush teeth (morning)", subtitle: "دقيقتان بدون تسرّع", subtitleEn: "2 minutes, don't rush", icon: "toothbrush" },
      { id: "h2", title: "غسل الوجه صباحاً ومساءً", titleEn: "Wash face morning & night", subtitle: "الانتظام = نتائج", subtitleEn: "Consistent = results", icon: "water" },
      { id: "h3", title: "واقي الشمس كل صباح", titleEn: "Apply SPF every morning", subtitle: "حتى في الأيام الغائمة", subtitleEn: "Even on cloudy days", icon: "weather-sunny" },
      { id: "h4", title: "تغيير الملابس الداخلية يومياً", titleEn: "Change underwear daily", subtitle: "غير قابل للتفاوض", subtitleEn: "Non-negotiable", icon: "check-circle" },
      { id: "h5", title: "مزيل العرق كل صباح", titleEn: "Deodorant every morning", subtitle: "قبل ارتداء الملابس", subtitleEn: "Before getting dressed", icon: "spray-bottle" },
      { id: "h6", title: "العناية بالأظافر أسبوعياً", titleEn: "Keep nails clean & trimmed", subtitle: "نظيفة ومقصوصة", subtitleEn: "Weekly check", icon: "hand-clap" },
      { id: "h7", title: "غسل الشعر ٢-٣ مرات أسبوعياً", titleEn: "Wash hair 2-3x per week", subtitle: "حسب نوع شعرك", subtitleEn: "Or as needed for your type", icon: "hair-dryer" },
      { id: "h8", title: "تنظيف الأسنان قبل النوم", titleEn: "Brush teeth before bed", subtitle: "أهم تنظيف في اليوم", subtitleEn: "Most important brush", icon: "toothbrush-paste" },
    ],
  },
];
