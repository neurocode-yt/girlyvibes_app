import { Router } from "express";

const activitiesRouter = Router();

const DEFAULT_ACTIVITIES = [
  { id: "a1",  titleAr: "رتّبي غرفتك من جديد",                     titleEn: "Rearrange your room",                            imageKey: "room",       durationAr: "١-٢ ساعة",    durationEn: "1-2 hrs" },
  { id: "a2",  titleAr: "ابدئي لوحة أحلامك",                        titleEn: "Start a vision board",                           imageKey: "creativity", durationAr: "١ ساعة",      durationEn: "1 hr"    },
  { id: "a3",  titleAr: "اكتبي رسالة لنفسك المستقبلية",              titleEn: "Write a letter to your future self",             imageKey: "writing",    durationAr: "٣٠ دقيقة",    durationEn: "30 min"  },
  { id: "a4",  titleAr: "تعلّمي تسريحة شعر جديدة",                  titleEn: "Learn a new hairstyle from a tutorial",          imageKey: "beauty",     durationAr: "٤٥ دقيقة",    durationEn: "45 min"  },
  { id: "a5",  titleAr: "تمشّي طويلاً والتقطي صوراً",               titleEn: "Go for a long walk and take photos",             imageKey: "nature",     durationAr: "١ ساعة",      durationEn: "1 hr"    },
  { id: "a6",  titleAr: "جرّبي وصفة طبخ جديدة",                     titleEn: "Cook or bake something new",                     imageKey: "cooking",    durationAr: "١ ساعة",      durationEn: "1 hr"    },
  { id: "a7",  titleAr: "اقرئي كتاباً لمدة ٣٠ دقيقة",              titleEn: "Read a book for 30 minutes",                    imageKey: "reading",    durationAr: "٣٠ دقيقة",    durationEn: "30 min"  },
  { id: "a8",  titleAr: "نظّمي خزانة ملابسك",                       titleEn: "Reorganize and clean your wardrobe",             imageKey: "room",       durationAr: "٢ ساعة",      durationEn: "2 hrs"   },
  { id: "a9",  titleAr: "تعلّمي ١٠ كلمات بلغة جديدة",              titleEn: "Learn 10 words in a new language",              imageKey: "reading",    durationAr: "٣٠ دقيقة",    durationEn: "30 min"  },
  { id: "a10", titleAr: "جلسة يوغا ٢٠ دقيقة",                      titleEn: "Do a 20-minute yoga session",                   imageKey: "fitness",    durationAr: "٢٠ دقيقة",    durationEn: "20 min"  },
  { id: "a11", titleAr: "ابدئي يومياتك أو bullet journal",          titleEn: "Start a journal or bullet journal",             imageKey: "writing",    durationAr: "٤٥ دقيقة",    durationEn: "45 min"  },
  { id: "a12", titleAr: "صنّفي قوائم تشغيل لكل مزاج",              titleEn: "Make a playlist for every mood",                imageKey: "music",      durationAr: "١ ساعة",      durationEn: "1 hr"    },
  { id: "a13", titleAr: "ارسمي أو خطّطي بحرية",                    titleEn: "Draw or sketch something",                      imageKey: "creativity", durationAr: "١ ساعة",      durationEn: "1 hr"    },
  { id: "a14", titleAr: "شاهدي وثائقياً ممتعاً",                   titleEn: "Watch a documentary",                           imageKey: "reading",    durationAr: "١ ساعة",      durationEn: "1 hr"    },
  { id: "a15", titleAr: "اكتبي قائمة أحلامك الـ١٠٠",               titleEn: "Write your top 100 dreams list",                imageKey: "writing",    durationAr: "١ ساعة",      durationEn: "1 hr"    },
  { id: "a16", titleAr: "تعلّمي لعبة ورق جديدة",                   titleEn: "Learn a new card game",                         imageKey: "games",      durationAr: "٣٠ دقيقة",    durationEn: "30 min"  },
  { id: "a17", titleAr: "جرّبي ماسك جديد للبشرة",                  titleEn: "Try a new skincare face mask",                  imageKey: "beauty",     durationAr: "٣٠ دقيقة",    durationEn: "30 min"  },
  { id: "a18", titleAr: "اكتبي شعراً أو قصة قصيرة",               titleEn: "Write poetry or short stories",                 imageKey: "writing",    durationAr: "١ ساعة",      durationEn: "1 hr"    },
  { id: "a19", titleAr: "نظّفي مكتبك بعمق",                        titleEn: "Deep clean your desk or workspace",             imageKey: "room",       durationAr: "٤٥ دقيقة",    durationEn: "45 min"  },
  { id: "a20", titleAr: "تصلي أو زوري أحد أجدادك",                 titleEn: "Call or visit a grandparent",                   imageKey: "nature",     durationAr: "٣٠ دقيقة",    durationEn: "30 min"  },
  { id: "a21", titleAr: "تعلّمي فن الأوريغامي",                    titleEn: "Learn origami with paper",                      imageKey: "creativity", durationAr: "٤٥ دقيقة",    durationEn: "45 min"  },
  { id: "a22", titleAr: "احلّي أحجية (١٠٠+ قطعة)",                 titleEn: "Do a puzzle (100+ pieces)",                     imageKey: "games",      durationAr: "٢ ساعة",      durationEn: "2 hrs"   },
  { id: "a23", titleAr: "جهّزي وجبات خفيفة صحية",                  titleEn: "Meal prep healthy snacks",                      imageKey: "cooking",    durationAr: "١ ساعة",      durationEn: "1 hr"    },
  { id: "a24", titleAr: "صنّعي قائمة موسيقى للدراسة",              titleEn: "Create a study-with-me playlist",               imageKey: "music",      durationAr: "٣٠ دقيقة",    durationEn: "30 min"  },
  { id: "a25", titleAr: "دهان أظافرك بتصميم مميز",                 titleEn: "Paint your nails with a fun design",            imageKey: "beauty",     durationAr: "٤٥ دقيقة",    durationEn: "45 min"  },
  { id: "a26", titleAr: "تعلّمي التأمل (٥ دقائق)",                 titleEn: "Learn to meditate (5 min)",                     imageKey: "fitness",    durationAr: "١٥ دقيقة",    durationEn: "15 min"  },
  { id: "a27", titleAr: "رتّبي صورك القديمة في ألبوم",             titleEn: "Sort through old photos and create an album",   imageKey: "reading",    durationAr: "١ ساعة",      durationEn: "1 hr"    },
  { id: "a28", titleAr: "اكتبي قيمك الشخصية",                      titleEn: "Write down your personal values",               imageKey: "writing",    durationAr: "٣٠ دقيقة",    durationEn: "30 min"  },
  { id: "a29", titleAr: "جرّبي حرفة جديدة (كروشيه، خط)",          titleEn: "Try a new craft (crochet, knitting, calligraphy)", imageKey: "creativity", durationAr: "٢ ساعة",   durationEn: "2 hrs"   },
  { id: "a30", titleAr: "ابحثي عن مكان تودّين زيارته",             titleEn: "Research a place you want to visit",            imageKey: "nature",     durationAr: "٤٥ دقيقة",    durationEn: "45 min"  },
];

activitiesRouter.get("/activities", (_req, res) => {
  res.json(DEFAULT_ACTIVITIES);
});

export default activitiesRouter;
