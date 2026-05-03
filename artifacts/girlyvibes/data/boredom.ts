export interface Activity {
  id: string;
  title: string;
  titleEn: string;
  imageKey: string;
  duration: string;
  durationEn: string;
}

export const ACTIVITIES: Activity[] = [
  { id: "a1",  title: "رتّبي غرفتك من جديد",                     titleEn: "Rearrange your room",                            imageKey: "room",       duration: "١-٢ ساعة",    durationEn: "1-2 hrs" },
  { id: "a2",  title: "ابدئي لوحة أحلامك",                        titleEn: "Start a vision board",                           imageKey: "creativity", duration: "١ ساعة",      durationEn: "1 hr"    },
  { id: "a3",  title: "اكتبي رسالة لنفسك المستقبلية",              titleEn: "Write a letter to your future self",             imageKey: "writing",    duration: "٣٠ دقيقة",    durationEn: "30 min"  },
  { id: "a4",  title: "تعلّمي تسريحة شعر جديدة",                  titleEn: "Learn a new hairstyle from a tutorial",          imageKey: "beauty",     duration: "٤٥ دقيقة",    durationEn: "45 min"  },
  { id: "a5",  title: "تمشّي طويلاً والتقطي صوراً",               titleEn: "Go for a long walk and take photos",             imageKey: "nature",     duration: "١ ساعة",      durationEn: "1 hr"    },
  { id: "a6",  title: "جرّبي وصفة طبخ جديدة",                     titleEn: "Cook or bake something new",                     imageKey: "cooking",    duration: "١ ساعة",      durationEn: "1 hr"    },
  { id: "a7",  title: "اقرئي كتاباً لمدة ٣٠ دقيقة",              titleEn: "Read a book for 30 minutes",                    imageKey: "reading",    duration: "٣٠ دقيقة",    durationEn: "30 min"  },
  { id: "a8",  title: "نظّمي خزانة ملابسك",                       titleEn: "Reorganize and clean your wardrobe",             imageKey: "room",       duration: "٢ ساعة",      durationEn: "2 hrs"   },
  { id: "a9",  title: "تعلّمي ١٠ كلمات بلغة جديدة",              titleEn: "Learn 10 words in a new language",              imageKey: "reading",    duration: "٣٠ دقيقة",    durationEn: "30 min"  },
  { id: "a10", title: "جلسة يوغا ٢٠ دقيقة",                      titleEn: "Do a 20-minute yoga session",                   imageKey: "fitness",    duration: "٢٠ دقيقة",    durationEn: "20 min"  },
  { id: "a11", title: "ابدئي يومياتك أو bullet journal",          titleEn: "Start a journal or bullet journal",             imageKey: "writing",    duration: "٤٥ دقيقة",    durationEn: "45 min"  },
  { id: "a12", title: "صنّفي قوائم تشغيل لكل مزاج",              titleEn: "Make a playlist for every mood",                imageKey: "music",      duration: "١ ساعة",      durationEn: "1 hr"    },
  { id: "a13", title: "ارسمي أو خطّطي بحرية",                    titleEn: "Draw or sketch something",                      imageKey: "creativity", duration: "١ ساعة",      durationEn: "1 hr"    },
  { id: "a14", title: "شاهدي وثائقياً ممتعاً",                   titleEn: "Watch a documentary",                           imageKey: "reading",    duration: "١ ساعة",      durationEn: "1 hr"    },
  { id: "a15", title: "اكتبي قائمة أحلامك الـ١٠٠",               titleEn: "Write your top 100 dreams list",                imageKey: "writing",    duration: "١ ساعة",      durationEn: "1 hr"    },
  { id: "a16", title: "تعلّمي لعبة ورق جديدة",                   titleEn: "Learn a new card game",                         imageKey: "games",      duration: "٣٠ دقيقة",    durationEn: "30 min"  },
  { id: "a17", title: "جرّبي ماسك جديد للبشرة",                  titleEn: "Try a new skincare face mask",                  imageKey: "beauty",     duration: "٣٠ دقيقة",    durationEn: "30 min"  },
  { id: "a18", title: "اكتبي شعراً أو قصة قصيرة",               titleEn: "Write poetry or short stories",                 imageKey: "writing",    duration: "١ ساعة",      durationEn: "1 hr"    },
  { id: "a19", title: "نظّفي مكتبك بعمق",                        titleEn: "Deep clean your desk or workspace",             imageKey: "room",       duration: "٤٥ دقيقة",    durationEn: "45 min"  },
  { id: "a20", title: "تصلي أو زوري أحد أجدادك",                 titleEn: "Call or visit a grandparent",                   imageKey: "nature",     duration: "٣٠ دقيقة",    durationEn: "30 min"  },
  { id: "a21", title: "تعلّمي فن الأوريغامي",                    titleEn: "Learn origami with paper",                      imageKey: "creativity", duration: "٤٥ دقيقة",    durationEn: "45 min"  },
  { id: "a22", title: "احلّي أحجية (١٠٠+ قطعة)",                 titleEn: "Do a puzzle (100+ pieces)",                     imageKey: "games",      duration: "٢ ساعة",      durationEn: "2 hrs"   },
  { id: "a23", title: "جهّزي وجبات خفيفة صحية",                  titleEn: "Meal prep healthy snacks",                      imageKey: "cooking",    duration: "١ ساعة",      durationEn: "1 hr"    },
  { id: "a24", title: "صنّعي قائمة موسيقى للدراسة",              titleEn: "Create a study-with-me playlist",               imageKey: "music",      duration: "٣٠ دقيقة",    durationEn: "30 min"  },
  { id: "a25", title: "دهان أظافرك بتصميم مميز",                 titleEn: "Paint your nails with a fun design",            imageKey: "beauty",     duration: "٤٥ دقيقة",    durationEn: "45 min"  },
  { id: "a26", title: "تعلّمي التأمل (٥ دقائق)",                 titleEn: "Learn to meditate (5 min)",                     imageKey: "fitness",    duration: "١٥ دقيقة",    durationEn: "15 min"  },
  { id: "a27", title: "رتّبي صورك القديمة في ألبوم",             titleEn: "Sort through old photos and create an album",   imageKey: "reading",    duration: "١ ساعة",      durationEn: "1 hr"    },
  { id: "a28", title: "اكتبي قيمك الشخصية",                      titleEn: "Write down your personal values",               imageKey: "writing",    duration: "٣٠ دقيقة",    durationEn: "30 min"  },
  { id: "a29", title: "جرّبي حرفة جديدة (كروشيه، خط)",          titleEn: "Try a new craft (crochet, knitting, calligraphy)", imageKey: "creativity", duration: "٢ ساعة",   durationEn: "2 hrs"   },
  { id: "a30", title: "ابحثي عن مكان تودّين زيارته",             titleEn: "Research a place you want to visit",            imageKey: "nature",     duration: "٤٥ دقيقة",    durationEn: "45 min"  },
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
