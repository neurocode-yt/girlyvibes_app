import { MaterialCommunityIcons } from "@expo/vector-icons";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export interface Activity {
  id: string;
  title: string;
  titleEn: string;
  icon: IconName;
  category: string;
  categoryEn: string;
  duration: string;
  durationEn: string;
  color: string;
}

export const ACTIVITIES: Activity[] = [
  { id: "a1", title: "رتّبي غرفتك من جديد", titleEn: "Rearrange your room", icon: "sofa-outline", category: "المنزل", categoryEn: "Home", duration: "١-٢ ساعة", durationEn: "1-2 hrs", color: "#FBE4EC" },
  { id: "a2", title: "ابدئي لوحة أحلامك", titleEn: "Start a vision board", icon: "image-multiple-outline", category: "الإبداع", categoryEn: "Creativity", duration: "١ ساعة", durationEn: "1 hr", color: "#F7C9D9" },
  { id: "a3", title: "اكتبي رسالة لنفسك المستقبلية", titleEn: "Write a letter to your future self", icon: "email-outline", category: "التأمل", categoryEn: "Reflection", duration: "٣٠ دقيقة", durationEn: "30 min", color: "#D8C9E8" },
  { id: "a4", title: "تعلّمي تسريحة شعر جديدة", titleEn: "Learn a new hairstyle from a tutorial", icon: "scissors-cutting", category: "الجمال", categoryEn: "Beauty", duration: "٤٥ دقيقة", durationEn: "45 min", color: "#FBE4EC" },
  { id: "a5", title: "تمشّي طويلاً والتقطي صوراً", titleEn: "Go for a long walk and take photos", icon: "camera-outline", category: "الهواء الطلق", categoryEn: "Outdoors", duration: "١ ساعة", durationEn: "1 hr", color: "#D5ECD4" },
  { id: "a6", title: "جرّبي وصفة طبخ جديدة", titleEn: "Cook or bake something new", icon: "chef-hat", category: "الطبخ", categoryEn: "Cooking", duration: "١ ساعة", durationEn: "1 hr", color: "#FDEBD0" },
  { id: "a7", title: "اقرئي كتاباً لمدة ٣٠ دقيقة", titleEn: "Read a book for 30 minutes", icon: "book-open-variant", category: "التعلم", categoryEn: "Learning", duration: "٣٠ دقيقة", durationEn: "30 min", color: "#C9DFF7" },
  { id: "a8", title: "نظّمي خزانة ملابسك", titleEn: "Reorganize and clean your wardrobe", icon: "hanger", category: "المنزل", categoryEn: "Home", duration: "٢ ساعة", durationEn: "2 hrs", color: "#FBE4EC" },
  { id: "a9", title: "تعلّمي ١٠ كلمات بلغة جديدة", titleEn: "Learn 10 words in a new language", icon: "translate", category: "التعلم", categoryEn: "Learning", duration: "٣٠ دقيقة", durationEn: "30 min", color: "#D8C9E8" },
  { id: "a10", title: "جلسة يوغا ٢٠ دقيقة", titleEn: "Do a 20-minute yoga session", icon: "yoga", category: "اللياقة", categoryEn: "Fitness", duration: "٢٠ دقيقة", durationEn: "20 min", color: "#D5ECD4" },
  { id: "a11", title: "ابدئي يومياتك أو bullet journal", titleEn: "Start a journal or bullet journal", icon: "notebook-edit-outline", category: "الإبداع", categoryEn: "Creativity", duration: "٤٥ دقيقة", durationEn: "45 min", color: "#F7C9D9" },
  { id: "a12", title: "صنّفي قوائم تشغيل لكل مزاج", titleEn: "Make a playlist for every mood", icon: "music-note", category: "الموسيقى", categoryEn: "Music", duration: "١ ساعة", durationEn: "1 hr", color: "#D8C9E8" },
  { id: "a13", title: "ارسمي أو خطّطي بحرية", titleEn: "Draw or sketch something", icon: "pencil-ruler", category: "الإبداع", categoryEn: "Creativity", duration: "١ ساعة", durationEn: "1 hr", color: "#FDEBD0" },
  { id: "a14", title: "شاهدي وثائقياً ممتعاً", titleEn: "Watch a documentary", icon: "television-play", category: "التعلم", categoryEn: "Learning", duration: "١ ساعة", durationEn: "1 hr", color: "#C9DFF7" },
  { id: "a15", title: "اكتبي قائمة أحلامك الـ١٠٠", titleEn: "Write your top 100 dreams list", icon: "star-outline", category: "التأمل", categoryEn: "Reflection", duration: "١ ساعة", durationEn: "1 hr", color: "#F7C9D9" },
  { id: "a16", title: "تعلّمي لعبة ورق جديدة", titleEn: "Learn a new card game", icon: "cards-playing", category: "الألعاب", categoryEn: "Games", duration: "٣٠ دقيقة", durationEn: "30 min", color: "#FBE4EC" },
  { id: "a17", title: "جرّبي ماسك جديد للبشرة", titleEn: "Try a new skincare face mask", icon: "face-woman-shimmer-outline", category: "الجمال", categoryEn: "Beauty", duration: "٣٠ دقيقة", durationEn: "30 min", color: "#F7C9D9" },
  { id: "a18", title: "اكتبي شعراً أو قصة قصيرة", titleEn: "Write poetry or short stories", icon: "typewriter", category: "الإبداع", categoryEn: "Creativity", duration: "١ ساعة", durationEn: "1 hr", color: "#D8C9E8" },
  { id: "a19", title: "نظّفي مكتبك بعمق", titleEn: "Deep clean your desk or workspace", icon: "broom", category: "المنزل", categoryEn: "Home", duration: "٤٥ دقيقة", durationEn: "45 min", color: "#FBE4EC" },
  { id: "a20", title: "تصلي أو زوري أحد أجدادك", titleEn: "Call or visit a grandparent", icon: "phone-outline", category: "التواصل", categoryEn: "Connection", duration: "٣٠ دقيقة", durationEn: "30 min", color: "#FDEBD0" },
  { id: "a21", title: "تعلّمي فن الأوريغامي", titleEn: "Learn origami with paper", icon: "star-four-points-outline", category: "الإبداع", categoryEn: "Creativity", duration: "٤٥ دقيقة", durationEn: "45 min", color: "#D5ECD4" },
  { id: "a22", title: "احلّي أحجية (١٠٠+ قطعة)", titleEn: "Do a puzzle (100+ pieces)", icon: "puzzle-outline", category: "الألعاب", categoryEn: "Games", duration: "٢ ساعة", durationEn: "2 hrs", color: "#C9DFF7" },
  { id: "a23", title: "جهّزي وجبات خفيفة صحية", titleEn: "Meal prep healthy snacks", icon: "food-apple-outline", category: "الطبخ", categoryEn: "Cooking", duration: "١ ساعة", durationEn: "1 hr", color: "#D5ECD4" },
  { id: "a24", title: "صنّعي قائمة موسيقى للدراسة", titleEn: "Create a study-with-me playlist", icon: "playlist-music", category: "الدراسة", categoryEn: "Study", duration: "٣٠ دقيقة", durationEn: "30 min", color: "#D8C9E8" },
  { id: "a25", title: "دهان أظافرك بتصميم مميز", titleEn: "Paint your nails with a fun design", icon: "nail", category: "الجمال", categoryEn: "Beauty", duration: "٤٥ دقيقة", durationEn: "45 min", color: "#F7C9D9" },
  { id: "a26", title: "تعلّمي التأمل (٥ دقائق)", titleEn: "Learn to meditate (5 min)", icon: "meditation", category: "الصحة", categoryEn: "Wellness", duration: "١٥ دقيقة", durationEn: "15 min", color: "#D8C9E8" },
  { id: "a27", title: "رتّبي صورك القديمة في ألبوم", titleEn: "Sort through old photos and create an album", icon: "image-outline", category: "الذكريات", categoryEn: "Memories", duration: "١ ساعة", durationEn: "1 hr", color: "#FDEBD0" },
  { id: "a28", title: "اكتبي قيمك الشخصية", titleEn: "Write down your personal values", icon: "heart-outline", category: "التأمل", categoryEn: "Reflection", duration: "٣٠ دقيقة", durationEn: "30 min", color: "#F7C9D9" },
  { id: "a29", title: "جرّبي حرفة جديدة (كروشيه، خط)", titleEn: "Try a new craft (crochet, knitting, calligraphy)", icon: "scissors-cutting", category: "الإبداع", categoryEn: "Creativity", duration: "٢ ساعة", durationEn: "2 hrs", color: "#FBE4EC" },
  { id: "a30", title: "ابحثي عن مكان تودّين زيارته", titleEn: "Research a place you want to visit", icon: "earth", category: "الأحلام", categoryEn: "Dreams", duration: "٤٥ دقيقة", durationEn: "45 min", color: "#C9DFF7" },
];

export const DETOX_CHALLENGES = [
  {
    id: "3day",
    title: "ريست ٣ أيام",
    titleEn: "3-Day Reset",
    description: "قلّلي استخدام هاتفك لمدة ٣ أيام",
    descriptionEn: "Reduce your phone use for 3 days",
    days: 3,
    color: "#F7C9D9",
    rules: [
      "لا هاتف في أول ٣٠ دقيقة بعد الاستيقاظ",
      "لا هاتف أثناء الوجبات",
      "أطفئي الهاتف ساعة قبل النوم",
      "استبدلي ساعة التصفح بنشاط بدون هاتف",
    ],
    rulesEn: [
      "No phone for the first 30 minutes after waking",
      "No phone during meals",
      "Phone off 1 hour before bed",
      "Replace 1 hour of scrolling with an offline activity",
    ],
  },
  {
    id: "7day",
    title: "تحدي ٧ أيام",
    titleEn: "7-Day Challenge",
    description: "أسبوع كامل من الاستخدام الواعي",
    descriptionEn: "A full week of mindful phone use",
    days: 7,
    color: "#C88AA0",
    rules: [
      "وقت الشاشة أقل من ساعتين يومياً (التواصل الاجتماعي فقط)",
      "لا هاتف في غرفة النوم بعد الساعة ٩ مساءً",
      "لا هاتف أثناء أي وجبة",
      "فترة بعد الظهر واحدة في الأسبوع بدون هاتف",
      "استبدلي التصفح بقراءة أو تمشية أو نشاط إبداعي",
    ],
    rulesEn: [
      "Daily screen time under 2 hours (social only)",
      "No phone in the bedroom after 9 PM",
      "No phone during any meal",
      "One completely phone-free afternoon per week",
      "Replace scrolling with a book, walk, or creative activity",
    ],
  },
];
