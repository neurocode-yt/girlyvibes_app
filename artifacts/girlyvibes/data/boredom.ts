import { MaterialCommunityIcons } from "@expo/vector-icons";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

export interface Activity {
  id: string;
  title: string;
  icon: IconName;
  category: string;
  duration: string;
  color: string;
}

export const ACTIVITIES: Activity[] = [
  { id: "a1", title: "رتّبي غرفتك من جديد", icon: "sofa-outline", category: "المنزل", duration: "١-٢ ساعة", color: "#FBE4EC" },
  { id: "a2", title: "ابدئي لوحة أحلامك", icon: "image-multiple-outline", category: "الإبداع", duration: "١ ساعة", color: "#F7C9D9" },
  { id: "a3", title: "اكتبي رسالة لنفسك المستقبلية", icon: "email-outline", category: "التأمل", duration: "٣٠ دقيقة", color: "#D8C9E8" },
  { id: "a4", title: "تعلّمي تسريحة شعر جديدة", icon: "scissors-cutting", category: "الجمال", duration: "٤٥ دقيقة", color: "#FBE4EC" },
  { id: "a5", title: "تمشّي طويلاً والتقطي صوراً", icon: "camera-outline", category: "الهواء الطلق", duration: "١ ساعة", color: "#D5ECD4" },
  { id: "a6", title: "جرّبي وصفة طبخ جديدة", icon: "chef-hat", category: "الطبخ", duration: "١ ساعة", color: "#FDEBD0" },
  { id: "a7", title: "اقرئي كتاباً لمدة ٣٠ دقيقة", icon: "book-open-variant", category: "التعلم", duration: "٣٠ دقيقة", color: "#C9DFF7" },
  { id: "a8", title: "نظّمي خزانة ملابسك", icon: "hanger", category: "المنزل", duration: "٢ ساعة", color: "#FBE4EC" },
  { id: "a9", title: "تعلّمي ١٠ كلمات بلغة جديدة", icon: "translate", category: "التعلم", duration: "٣٠ دقيقة", color: "#D8C9E8" },
  { id: "a10", title: "جلسة يوغا ٢٠ دقيقة", icon: "yoga", category: "اللياقة", duration: "٢٠ دقيقة", color: "#D5ECD4" },
  { id: "a11", title: "ابدئي يومياتك أو bullet journal", icon: "notebook-edit-outline", category: "الإبداع", duration: "٤٥ دقيقة", color: "#F7C9D9" },
  { id: "a12", title: "صنّفي قوائم تشغيل لكل مزاج", icon: "music-note", category: "الموسيقى", duration: "١ ساعة", color: "#D8C9E8" },
  { id: "a13", title: "ارسمي أو خطّطي بحرية", icon: "pencil-ruler", category: "الإبداع", duration: "١ ساعة", color: "#FDEBD0" },
  { id: "a14", title: "شاهدي وثائقياً ممتعاً", icon: "television-play", category: "التعلم", duration: "١ ساعة", color: "#C9DFF7" },
  { id: "a15", title: "اكتبي قائمة أحلامك الـ١٠٠", icon: "star-outline", category: "التأمل", duration: "١ ساعة", color: "#F7C9D9" },
  { id: "a16", title: "تعلّمي لعبة ورق جديدة", icon: "cards-playing", category: "الألعاب", duration: "٣٠ دقيقة", color: "#FBE4EC" },
  { id: "a17", title: "جرّبي ماسك جديد للبشرة", icon: "face-woman-shimmer-outline", category: "الجمال", duration: "٣٠ دقيقة", color: "#F7C9D9" },
  { id: "a18", title: "اكتبي شعراً أو قصة قصيرة", icon: "typewriter", category: "الإبداع", duration: "١ ساعة", color: "#D8C9E8" },
  { id: "a19", title: "نظّفي مكتبك بعمق", icon: "broom", category: "المنزل", duration: "٤٥ دقيقة", color: "#FBE4EC" },
  { id: "a20", title: "تصلي أو زوري أحد أجدادك", icon: "phone-outline", category: "التواصل", duration: "٣٠ دقيقة", color: "#FDEBD0" },
  { id: "a21", title: "تعلّمي فن الأوريغامي", icon: "star-four-points-outline", category: "الإبداع", duration: "٤٥ دقيقة", color: "#D5ECD4" },
  { id: "a22", title: "احلّي أحجية (١٠٠+ قطعة)", icon: "puzzle-outline", category: "الألعاب", duration: "٢ ساعة", color: "#C9DFF7" },
  { id: "a23", title: "جهّزي وجبات خفيفة صحية", icon: "food-apple-outline", category: "الطبخ", duration: "١ ساعة", color: "#D5ECD4" },
  { id: "a24", title: "صنّعي قائمة موسيقى للدراسة", icon: "playlist-music", category: "الدراسة", duration: "٣٠ دقيقة", color: "#D8C9E8" },
  { id: "a25", title: "دهان أظافرك بتصميم مميز", icon: "nail", category: "الجمال", duration: "٤٥ دقيقة", color: "#F7C9D9" },
  { id: "a26", title: "تعلّمي التأمل (٥ دقائق)", icon: "meditation", category: "الصحة", duration: "١٥ دقيقة", color: "#D8C9E8" },
  { id: "a27", title: "رتّبي صورك القديمة في ألبوم", icon: "image-outline", category: "الذكريات", duration: "١ ساعة", color: "#FDEBD0" },
  { id: "a28", title: "اكتبي قيمك الشخصية", icon: "heart-outline", category: "التأمل", duration: "٣٠ دقيقة", color: "#F7C9D9" },
  { id: "a29", title: "جرّبي حرفة جديدة (كروشيه، خط)", icon: "scissors-cutting", category: "الإبداع", duration: "٢ ساعة", color: "#FBE4EC" },
  { id: "a30", title: "ابحثي عن مكان تودّين زيارته", icon: "earth", category: "الأحلام", duration: "٤٥ دقيقة", color: "#C9DFF7" },
];

export const DETOX_CHALLENGES = [
  {
    id: "3day",
    title: "ريست ٣ أيام",
    description: "قلّلي استخدام هاتفك لمدة ٣ أيام",
    days: 3,
    color: "#F7C9D9",
    rules: [
      "لا هاتف في أول ٣٠ دقيقة بعد الاستيقاظ",
      "لا هاتف أثناء الوجبات",
      "أطفئي الهاتف ساعة قبل النوم",
      "استبدلي ساعة التصفح بنشاط بدون هاتف",
    ],
  },
  {
    id: "7day",
    title: "تحدي ٧ أيام",
    description: "أسبوع كامل من الاستخدام الواعي",
    days: 7,
    color: "#C88AA0",
    rules: [
      "وقت الشاشة أقل من ساعتين يومياً (التواصل الاجتماعي فقط)",
      "لا هاتف في غرفة النوم بعد الساعة ٩ مساءً",
      "لا هاتف أثناء أي وجبة",
      "فترة بعد الظهر واحدة في الأسبوع بدون هاتف",
      "استبدلي التصفح بقراءة أو تمشية أو نشاط إبداعي",
    ],
  },
];
