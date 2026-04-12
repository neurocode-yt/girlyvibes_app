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
      { id: "m1", title: "اشربي كوب ماء", subtitle: "رطّبي جسمك فوراً", icon: "water" },
      { id: "m2", title: "اغسلي وجهك", subtitle: "منظّف لطيف للبشرة", icon: "face-man-shimmer" },
      { id: "m3", title: "ضعي المرطّب", subtitle: "مع واقي شمس عند الخروج", icon: "lotion-plus" },
      { id: "m4", title: "اغسلي أسنانك", subtitle: "دقيقتان على الأقل", icon: "toothbrush" },
      { id: "m5", title: "رتّبي شعرك", subtitle: "اجعلي مظهرك أنيقاً", icon: "hair-dryer" },
      { id: "m6", title: "ارتدي ملابسك", subtitle: "اختاري ما يجعلك سعيدة", icon: "hanger" },
      { id: "m7", title: "تناولي الإفطار", subtitle: "غذّي عقلك وجسمك", icon: "food-apple" },
      { id: "m8", title: "حدّدي نيّة اليوم", subtitle: "ما هو تركيزك اليوم؟", icon: "star-shooting" },
    ],
  },
  {
    id: "school",
    title: "روتين المدرسة",
    subtitle: "احضري بأفضل نسخة منك",
    emoji: "book-open-variant",
    color: "#D5ECD4",
    steps: [
      { id: "s1", title: "جهّزي حقيبتك مساءً", subtitle: "لا قلق في الصباح", icon: "bag-personal" },
      { id: "s2", title: "راجعي جدول اليوم", subtitle: "اعرفي ما ينتظرك", icon: "calendar-today" },
      { id: "s3", title: "احضري مبكرة ٥ دقائق", subtitle: "بداية هادئة = تركيز أفضل", icon: "clock-outline" },
      { id: "s4", title: "اشربي ماء في الحصص", subtitle: "ابقي يقظة ومنتبهة", icon: "cup-water" },
      { id: "s5", title: "دوّني ملاحظات بنشاط", subtitle: "اكتبي النقاط المهمة", icon: "pencil" },
      { id: "s6", title: "تحدّثي مع شخص واحد", subtitle: "التواصل مهم جداً", icon: "account-group" },
      { id: "s7", title: "راجعي قائمة الواجبات", subtitle: "قبل مغادرة المدرسة", icon: "checkbox-marked-outline" },
    ],
  },
  {
    id: "evening",
    title: "روتين المساء",
    subtitle: "أنهي يومك بهدوء",
    emoji: "weather-night",
    color: "#D8C9E8",
    steps: [
      { id: "e1", title: "ضعي الهاتف جانباً", subtitle: "ساعة قبل النوم", icon: "cellphone-off" },
      { id: "e2", title: "أزيلي المكياج ونظّفي وجهك", subtitle: "لا تنامي بمكياج أبداً", icon: "face-woman-shimmer" },
      { id: "e3", title: "ضعي كريم الليل أو السيروم", subtitle: "البشرة تتجدد أثناء النوم", icon: "bottle-tonic" },
      { id: "e4", title: "فرشاة الأسنان والخيط", subtitle: "بداية جديدة نظيفة", icon: "toothbrush-paste" },
      { id: "e5", title: "جهّزي ملابس الغد", subtitle: "أقل توتر في الصباح", icon: "tshirt-crew" },
      { id: "e6", title: "يوميات أو كتابة الامتنان", subtitle: "٣ أشياء تشكرين عليها", icon: "notebook-edit" },
      { id: "e7", title: "اقرئي أو استمعي لموسيقى هادئة", subtitle: "استعدّي للنوم", icon: "book-open" },
      { id: "e8", title: "أطفئي الأضواء قبل ١٠ مساءً", subtitle: "نوم الجمال حقيقي", icon: "sleep" },
    ],
  },
  {
    id: "shower",
    title: "حمام الاهتمام الكامل",
    subtitle: "تجديد كامل من الرأس للقدم",
    emoji: "shower-head",
    color: "#C9DFF7",
    steps: [
      { id: "sh1", title: "تدليك جاف للجلد", subtitle: "قبل الاستحمام للتوهج", icon: "brush" },
      { id: "sh2", title: "غسل الشعر بالشامبو", subtitle: "دلّكي فروة الرأس بلطف", icon: "shaker" },
      { id: "sh3", title: "بلسم عميق للشعر", subtitle: "اتركيه أثناء الاستحمام", icon: "hair-dryer-outline" },
      { id: "sh4", title: "مقشّر الجسم", subtitle: "ركّزي على الكوعين والركبتين", icon: "spa-outline" },
      { id: "sh5", title: "إزالة الشعر عند الحاجة", subtitle: "خذي وقتك", icon: "scissors-cutting" },
      { id: "sh6", title: "شطف بالماء البارد", subtitle: "يغلق المسام ويختم اللمعان", icon: "water-thermometer" },
      { id: "sh7", title: "شطف البلسم جيداً", subtitle: "شطف كامل لشعر ناعم", icon: "waves" },
      { id: "sh8", title: "ضعي مرطّب الجسم فوراً", subtitle: "والجلد لا يزال رطباً", icon: "lotion" },
      { id: "sh9", title: "مزيل عرق وعطر", subtitle: "رائحة رائعة طوال اليوم", icon: "spray" },
      { id: "sh10", title: "روتين العناية بالبشرة", subtitle: "تونر، سيروم، مرطّب", icon: "face-woman" },
    ],
  },
  {
    id: "hygiene",
    title: "النظافة من الألف للياء",
    subtitle: "عادات النظافة اليومية",
    emoji: "star-four-points",
    color: "#F9D9D9",
    steps: [
      { id: "h1", title: "تنظيف الأسنان صباحاً", subtitle: "دقيقتان بدون تسرّع", icon: "toothbrush" },
      { id: "h2", title: "غسل الوجه صباحاً ومساءً", subtitle: "الانتظام = نتائج", icon: "water" },
      { id: "h3", title: "واقي الشمس كل صباح", subtitle: "حتى في الأيام الغائمة", icon: "weather-sunny" },
      { id: "h4", title: "تغيير الملابس الداخلية يومياً", subtitle: "غير قابل للتفاوض", icon: "check-circle" },
      { id: "h5", title: "مزيل العرق كل صباح", subtitle: "قبل ارتداء الملابس", icon: "spray-bottle" },
      { id: "h6", title: "العناية بالأظافر أسبوعياً", subtitle: "نظيفة ومقصوصة", icon: "hand-clap" },
      { id: "h7", title: "غسل الشعر ٢-٣ مرات أسبوعياً", subtitle: "حسب نوع شعرك", icon: "hair-dryer" },
      { id: "h8", title: "تنظيف الأسنان قبل النوم", subtitle: "أهم تنظيف في اليوم", icon: "toothbrush-paste" },
    ],
  },
];
