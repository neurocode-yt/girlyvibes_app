export interface AdviceCard {
  id: string;
  title: string;
  preview: string;
  content: string;
  category: string;
  readTime: string;
}

export interface AdviceCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  cards: AdviceCard[];
}

export const ADVICE_CATEGORIES: AdviceCategory[] = [
  {
    id: "teen",
    title: "Teen Life",
    icon: "star-outline",
    color: "#FDEBD0",
    cards: [
      {
        id: "t1",
        title: "You're not falling behind",
        preview: "Everyone grows at their own pace — and that's beautiful.",
        content: "It can feel like everyone around you has it figured out while you're still trying to understand who you are. But here's the truth: most of them feel the same way. \n\nGrowing up isn't a race. You don't need to have your life figured out at 15 or 17. Some of the most incredible women found their purpose in their 20s, 30s, even 40s. \n\nYour job right now is to stay curious, be kind to yourself, and take small steps forward every day. The rest will follow. You are exactly where you need to be.",
        category: "teen",
        readTime: "2 min",
      },
      {
        id: "t2",
        title: "How to deal with being left out",
        preview: "Social situations hurt sometimes — here's how to get through them.",
        content: "Being left out of a group, not being invited to something, or feeling like you don't quite fit in — it stings. And it's okay to feel sad or hurt about it.\n\nBut here's what to remember: being left out doesn't say anything about your worth. Groups shift, friendships evolve, and sometimes you just haven't found your people yet.\n\nWhat helps:\n• Let yourself feel it — don't push the feeling away\n• Talk to someone you trust about how you feel\n• Invest in the friendships that do make you feel seen\n• Use the time to do something you genuinely love\n\nYour people exist. Sometimes you have to grow into them.",
        category: "teen",
        readTime: "3 min",
      },
      {
        id: "t3",
        title: "Body changes are normal",
        preview: "Your body is doing something incredible right now.",
        content: "Puberty can feel confusing, uncomfortable, and sometimes really overwhelming. Your body is changing in ways that might surprise you — and that's completely normal.\n\nEvery girl's body develops at a different pace. Some will see changes earlier, others later. Neither is wrong. Neither is better.\n\nThings to know:\n• Acne is incredibly common — it's hormonal, not dirty\n• Weight distribution changes and that's healthy\n• You may sweat more — daily deodorant helps\n• Cramps and mood shifts during your cycle are real and valid\n\nBe patient and gentle with your body. It's doing the best it can, and it deserves care — not criticism.",
        category: "teen",
        readTime: "3 min",
      },
      {
        id: "t4",
        title: "When friendships feel complicated",
        preview: "Not every friendship is meant to last forever — and that's okay.",
        content: "Sometimes the friendships that once felt easy start to feel heavy. Maybe you've grown in different directions. Maybe someone said something that hurt. Maybe you just feel like yourself around some people and not others.\n\nFriendship is not about quantity. It's about quality. One person who truly sees you and accepts you is worth more than a whole group that makes you feel small.\n\nIf a friendship is draining you more than it's filling you, it's okay to create distance. You don't need to have a dramatic ending — sometimes friendships just slowly change, and that's part of life.\n\nProtect your energy. You deserve friendships that feel warm and safe.",
        category: "teen",
        readTime: "2 min",
      },
      {
        id: "t5",
        title: "Social media vs. real life",
        preview: "The highlight reel on your screen isn't the full story.",
        content: "It's so easy to scroll and feel like everyone else has perfect skin, perfect friends, perfect everything. But what you're seeing is a curated highlight reel — the very best moments, filtered and edited.\n\nNo one posts their messy room, their bad skin days, their cried-in-the-bathroom moments. They post the glow up, the celebration, the perfect outfit.\n\nHow to protect your mind:\n• Limit mindless scrolling — set a daily limit\n• Unfollow accounts that make you feel bad about yourself\n• Follow creators who make you feel inspired, not inadequate\n• Put the phone down and look at real life\n\nYour real life — with all its messiness — is more valuable than anything on a screen.",
        category: "teen",
        readTime: "3 min",
      },
      {
        id: "t6",
        title: "It's okay to not know what you want yet",
        preview: "You don't have to have a plan. You just have to show up.",
        content: "Adults will ask what you want to do with your life. And it can feel terrifying to say 'I don't know.'\n\nBut here's a secret: most people in their 20s and 30s don't fully know either. They're figuring it out as they go — and so can you.\n\nWhat you can do now:\n• Notice what you genuinely enjoy (not what looks impressive)\n• Try things — clubs, hobbies, subjects — even if they fail\n• Pay attention to what makes time fly when you're doing it\n• Talk to people doing jobs or lives that interest you\n\nYou don't need a destination. You just need to keep moving, stay curious, and trust that it will come together.",
        category: "teen",
        readTime: "2 min",
      },
    ],
  },
  {
    id: "confidence",
    title: "Confidence",
    icon: "heart-outline",
    color: "#F7C9D9",
    cards: [
      {
        id: "c1",
        title: "Confidence isn't born, it's built",
        preview: "The most confident girls weren't always that way.",
        content: "Confidence looks effortless from the outside — like some people just have it and others don't. But that's not how it works.\n\nConfidence is built through small, repeated acts of courage. Every time you do something uncomfortable and survive it, your confidence grows a little. Every time you challenge a negative thought, your inner voice gets a little kinder.\n\nHow to start building it:\n• Keep promises to yourself — do what you say you'll do\n• Take small risks daily — raise your hand, say hello first\n• Celebrate small wins — they add up\n• Stop waiting until you feel 'ready' — do it afraid\n\nYou don't need to feel confident to act confidently. Act first, and the feeling follows.",
        category: "confidence",
        readTime: "3 min",
      },
      {
        id: "c2",
        title: "How to walk into a room with confidence",
        preview: "Your body language tells a story before you speak.",
        content: "You know those people who walk into a room and just seem comfortable? It's mostly body language.\n\nConfident body language:\n• Stand up straight — chin parallel to the ground\n• Shoulders back and relaxed\n• Walk at a steady, unhurried pace\n• Make soft eye contact (look at people, not the floor)\n• Smile — it signals friendliness and ease\n\nHere's the trick: your body and brain talk to each other. When you stand tall, your brain actually starts to feel more confident. It works in both directions.\n\nBefore you enter a room, take a deep breath. Roll your shoulders back. Lift your chin slightly. Then go in like you belong — because you do.",
        category: "confidence",
        readTime: "2 min",
      },
      {
        id: "c3",
        title: "Stop apologizing for existing",
        preview: "You don't have to shrink yourself to make others comfortable.",
        content: "Do you catch yourself saying sorry for things that don't require an apology? Sorry for speaking. Sorry for taking up space. Sorry for having needs or opinions.\n\nThis habit — over-apologizing — is incredibly common in girls. And it slowly erodes your confidence from the inside.\n\nTry replacing:\n• 'Sorry to bother you' → 'Do you have a moment?'\n• 'Sorry, I'm probably wrong but...' → 'I think...'\n• 'Sorry, can I...' → 'Could I...'\n\nYou are allowed to have opinions, make requests, and take up space — without apologizing for it. Your presence is not an inconvenience. Don't treat it like one.",
        category: "confidence",
        readTime: "2 min",
      },
      {
        id: "c4",
        title: "Dealing with mean comments",
        preview: "What someone says about you says more about them than you.",
        content: "Someone made a mean comment about how you look. About what you said. About your interests. It stings — even when you try not to let it.\n\nHere's what to remember:\n\nMean comments come from pain. People who are secure in themselves don't need to tear others down. When someone is cruel, it's a window into their own insecurity, not a verdict on your worth.\n\nWhat to do:\n• Don't reply in the moment if you're hurt — take time first\n• You're allowed to set limits: 'Please don't speak to me like that'\n• Talk to someone you trust about how it made you feel\n• Write it out in a journal and release it\n\nYou don't have to carry their words. Put them down.",
        category: "confidence",
        readTime: "3 min",
      },
      {
        id: "c5",
        title: "How to speak up for yourself",
        preview: "Your voice matters. Here's how to use it.",
        content: "Speaking up feels scary — whether it's disagreeing with a teacher, asking for help, or telling a friend that something they said hurt you.\n\nBut staying silent has a cost. When you consistently silence yourself, it sends a message to your brain that your thoughts and feelings don't matter. Over time, that belief becomes real.\n\nPractice speaking up in small ways:\n• Order food for yourself at a restaurant\n• Return something to a store even if it feels awkward\n• Share your opinion in a group when you disagree\n• Tell someone when you need space or time\n\nEvery time you use your voice, it gets stronger. You have something to say. The world needs to hear it.",
        category: "confidence",
        readTime: "2 min",
      },
      {
        id: "c6",
        title: "You are not your appearance",
        preview: "Your worth isn't measured in the mirror.",
        content: "We live in a world that is obsessed with how women look. And it's easy to absorb the message that your worth is tied to your appearance — your weight, your skin, your hair.\n\nBut you are so much more than how you look.\n\nYou are your curiosity. Your sense of humor. The way you listen. The ideas you have. The things you care about deeply. The kindness you show without anyone noticing.\n\nCaring for your appearance is great — because it can be an act of self-love. But it's one small part of who you are.\n\nOn the days when the mirror feels cruel, remind yourself: your appearance is something you have, not who you are.",
        category: "confidence",
        readTime: "2 min",
      },
    ],
  },
  {
    id: "school",
    title: "School & Study",
    icon: "book-outline",
    color: "#D5ECD4",
    cards: [
      {
        id: "sc1",
        title: "Study smarter, not longer",
        preview: "Hours don't equal learning. Method does.",
        content: "Sitting at your desk for 4 hours doesn't mean you've studied for 4 hours. You can sit in front of a book for hours and retain almost nothing.\n\nWhat actually works:\n• Active recall — close the book and try to remember what you just read\n• Spaced repetition — review material at intervals (not all at once)\n• Pomodoro technique — 25 min focused study, 5 min break\n• Teach it to someone — if you can explain it, you understand it\n\nThe goal isn't to spend the most time. It's to retain the most information. Study with intention, take real breaks, and your brain will thank you.",
        category: "school",
        readTime: "3 min",
      },
      {
        id: "sc2",
        title: "When you feel like giving up on school",
        preview: "Hard days don't mean you're not capable.",
        content: "There will be days when school feels pointless. When you fail a test you studied hard for, when the material seems impossible, when you feel stupid in class.\n\nThose days don't define your intelligence. They're part of the process.\n\nWhat to do when you hit a wall:\n• Take a 15-minute break — seriously walk away from it\n• Ask for help — asking is brave, not weak\n• Focus on one small step, not the whole mountain\n• Remember: difficulty = learning. Easy means you already knew it.\n\nThe students who succeed aren't always the smartest. They're the ones who keep going even when it's hard. You can be that person.",
        category: "school",
        readTime: "2 min",
      },
      {
        id: "sc3",
        title: "How to take notes that actually help",
        preview: "The way you write is as important as what you write.",
        content: "Writing down everything the teacher says word-for-word isn't note-taking — it's transcription. And it doesn't help you learn.\n\nBetter note-taking:\n• Listen first, write the key idea (not every word)\n• Use your own words — this forces your brain to process it\n• Use short bullet points, not long sentences\n• Leave space and come back to add details after class\n• Mark things you don't understand with a ? to review later\n\nAfter class, spend 5 minutes reviewing what you wrote while it's still fresh. This one habit can double what you retain.\n\nYour notes are a tool for your future self. Write them for her.",
        category: "school",
        readTime: "3 min",
      },
      {
        id: "sc4",
        title: "Handling exam anxiety",
        preview: "Nerves are normal — here's how to work with them, not against them.",
        content: "Your heart is racing. Your palms are sweaty. Your mind goes blank right when you need it most.\n\nExam anxiety is incredibly common, and it doesn't mean you're not prepared.\n\nIn the moment:\n• Take 3 slow, deep breaths before you start\n• Read the whole exam first — get familiar with it\n• Start with what you know — build momentum\n• If you blank, move on and come back\n\nLong-term:\n• Start studying earlier — urgency creates anxiety\n• Study in the same conditions as the test if possible\n• Sleep well the night before — more than cramming\n• Tell yourself: I've prepared. I'm ready.\n\nYou know more than you think.",
        category: "school",
        readTime: "3 min",
      },
      {
        id: "sc5",
        title: "Making the most of school socially",
        preview: "School is about more than grades — it's also where you learn who you are.",
        content: "School friendships, experiences, and memories are a big part of what shapes you. Don't let the pressure of grades make you miss the human part of school.\n\nThings worth doing:\n• Join at least one club or activity you're genuinely interested in\n• Talk to people outside your usual friend group\n• Ask questions in class — you're not the only one who doesn't understand\n• Be kind to teachers — relationships matter\n• Show up for classmates — group studying can be fun if you do it right\n\nYour grades matter. But so does learning how to connect with people, navigate conflict, and work in teams. School is teaching you both.",
        category: "school",
        readTime: "2 min",
      },
      {
        id: "sc6",
        title: "Failing doesn't mean you're a failure",
        preview: "A bad grade is not a verdict on your worth or potential.",
        content: "Getting a bad grade hurts. Especially when you tried. It can make you question whether you're smart enough, whether you'll ever get it right.\n\nBut one test result — or even a semester of results — is not your story.\n\nSome things to hold onto:\n• Failure is information, not identity\n• Every subject is a skill that improves with practice\n• Grades measure one type of performance on one type of task\n• Some of the most successful people in history were not A students\n\nWhen you fail: let yourself feel disappointed, then ask: what can I learn from this? That question is the difference between setback and growth.",
        category: "school",
        readTime: "2 min",
      },
    ],
  },
  {
    id: "hygiene",
    title: "Hygiene & Body",
    icon: "water-outline",
    color: "#C9DFF7",
    cards: [
      {
        id: "hy1",
        title: "The basics every girl needs to know",
        preview: "Simple habits that make a big difference.",
        content: "Nobody teaches this stuff in a clear way — so here it is.\n\nThe basics:\n• Shower or bathe at least every other day (daily if you exercise)\n• Wash your face every morning and night\n• Use deodorant every morning after showering\n• Change your underwear daily — always\n• Brush teeth twice a day — morning and before bed\n• Wash your hair as needed for your hair type (2-4x a week usually)\n• Moisturize after showering while skin is still slightly damp\n\nThese aren't glamorous. They're foundational. And when you do them consistently, your skin, smell, and confidence all improve naturally.",
        category: "hygiene",
        readTime: "2 min",
      },
      {
        id: "hy2",
        title: "Understanding your skin",
        preview: "Your skin type matters — and so does caring for it properly.",
        content: "Not all skin is the same. Knowing your skin type helps you care for it better.\n\nSkin types:\n• Oily: shiny throughout the day, prone to acne, large pores\n• Dry: feels tight, may flake, gets worse in cold weather\n• Combination: oily in the T-zone (forehead, nose), dry elsewhere\n• Sensitive: reacts to products easily, gets red or irritated\n• Normal: balanced, not too oily or dry\n\nBasic skincare regardless of type:\n1. Gentle cleanser (morning and night)\n2. Moisturizer (always, even oily skin needs it)\n3. SPF every morning\n\nStart simple. You don't need 10 products. Three basics done consistently beats any elaborate routine done occasionally.",
        category: "hygiene",
        readTime: "3 min",
      },
      {
        id: "hy3",
        title: "Dealing with acne honestly",
        preview: "Acne is normal, common, and manageable.",
        content: "Acne affects almost every teenager at some point. It's not a sign of being dirty or unhealthy. It's hormonal — your body is changing and your skin is adjusting.\n\nWhat helps:\n• Wash your face gently twice a day (don't over-scrub)\n• Change your pillowcase frequently\n• Keep hands away from your face\n• Use non-comedogenic (non-pore-clogging) products\n• Salicylic acid or benzoyl peroxide can help with breakouts\n• If it's severe, a dermatologist can really help\n\nWhat doesn't help:\n• Picking or popping (it causes scarring and spreads bacteria)\n• Over-washing (strips skin and makes it produce more oil)\n• Harsh scrubs (they irritate and inflame)\n\nBe patient. Skincare results take weeks. Stay consistent.",
        category: "hygiene",
        readTime: "3 min",
      },
      {
        id: "hy4",
        title: "Period care and comfort",
        preview: "Your period doesn't have to be a week of suffering.",
        content: "Your period is a normal, healthy part of being a girl. It can come with discomfort — and there are real things that help.\n\nComfort tips:\n• Heat on your lower abdomen helps with cramps (hot water bottle, heat patch)\n• Light movement like walking or yoga can reduce pain\n• Stay hydrated — water helps reduce bloating\n• Ibuprofen works well for cramps (take with food)\n• Rest when your body needs it — it's okay\n\nTracking your cycle:\n• Use an app to track when your period starts each month\n• Knowing your cycle helps you prepare and understand your moods\n\nWhen to see a doctor:\n• Cramps that stop you from functioning\n• Very heavy bleeding\n• Periods lasting longer than 7 days\n\nYour body is doing something extraordinary every month.",
        category: "hygiene",
        readTime: "3 min",
      },
      {
        id: "hy5",
        title: "Hair care for your type",
        preview: "What works for someone else's hair might not work for yours.",
        content: "Hair care is not one-size-fits-all. Your hair type matters — straight, wavy, curly, or coily each need different approaches.\n\nGeneral rules for all types:\n• Don't wash every day unless your hair gets very oily — it strips natural oils\n• Use conditioner after shampooing (except at roots if oily)\n• Protect hair from heat — use a heat protectant before styling tools\n• Be gentle — wet hair is fragile, brush or detangle carefully\n• Trim ends every 2-3 months to prevent split ends\n\nFor oily hair: wash more frequently, focus shampoo on scalp\nFor dry/curly hair: deep condition weekly, use leave-in conditioner, reduce heat\n\nLearning what your specific hair needs takes time. Pay attention to what makes it look and feel its best.",
        category: "hygiene",
        readTime: "3 min",
      },
      {
        id: "hy6",
        title: "Feminine hygiene essentials",
        preview: "What you actually need to know — no fluff.",
        content: "This topic is often surrounded by myths and embarrassment. Let's clear it up.\n\nThe basics:\n• Your body is self-cleaning — you don't need special washes inside\n• Wash the external area (vulva) with warm water and mild, unscented soap\n• Change pads or tampons every 4-6 hours during your period\n• Wear breathable cotton underwear when possible\n• Avoid tight synthetic clothing for extended periods\n• Wipe front to back, always\n\nNormal vs. not normal:\n• Normal: clear or white discharge (varies through the cycle)\n• See a doctor if: strong odor, unusual color, itching, burning\n\nYour body is healthy by design. Give it clean, simple care — not complicated products.",
        category: "hygiene",
        readTime: "2 min",
      },
    ],
  },
  {
    id: "emotional",
    title: "Emotional Support",
    icon: "hands-pray",
    color: "#D8C9E8",
    cards: [
      {
        id: "em1",
        title: "You are not alone",
        preview: "Whatever you're going through, someone else has been there too.",
        content: "There are feelings that can make you feel like you're the only one who has ever experienced them. The only one who feels this lonely. This confused. This overwhelmed.\n\nYou're not.\n\nThe human experience — especially the teenage years — is full of emotions that feel too big for the body they're in. Anxiety, sadness, loneliness, the feeling that you don't fit anywhere — these are as old as humanity itself.\n\nThat doesn't make them easy. But it means that somewhere out there, someone has felt exactly what you're feeling and made it through. And so will you.\n\nIf you're struggling, please tell someone — a parent, a trusted adult, a school counselor. You don't have to carry it alone.",
        category: "emotional",
        readTime: "2 min",
      },
      {
        id: "em2",
        title: "How to process big emotions",
        preview: "Feelings don't disappear when you push them down — they just wait.",
        content: "You might have learned to push emotions away — to be strong, to not show weakness, to keep going. But suppressed emotions don't disappear. They show up later, bigger and messier.\n\nHealthier ways to process:\n• Name it: say 'I feel sad because...' — naming makes emotions smaller\n• Write it: Journaling is one of the most effective ways to process feelings\n• Move: Physical activity literally moves emotions through your body\n• Talk: Find someone safe to share with\n• Let yourself cry: Tears are not weakness — they're release\n\nYou don't have to be okay all the time. You just have to keep processing, keep moving, and keep asking for support when you need it.",
        category: "emotional",
        readTime: "3 min",
      },
      {
        id: "em3",
        title: "What anxiety actually feels like",
        preview: "Understanding it is the first step to managing it.",
        content: "Anxiety isn't just nervousness. It can be:\n• Constant worry about things that might go wrong\n• A racing heart even when nothing scary is happening\n• Stomach aches or headaches with no medical cause\n• Avoiding things because they feel overwhelming\n• Difficulty sleeping or concentrating\n• The feeling that something bad is about to happen\n\nIf this sounds familiar, know that anxiety is one of the most common experiences in teens — and it's treatable.\n\nWhat helps:\n• Deep breathing (slow inhale, hold, slow exhale)\n• Grounding: name 5 things you can see, 4 you can touch...\n• Reducing caffeine\n• Talking to a trusted adult or counselor\n\nYou are not broken. You are a person whose nervous system needs some support.",
        category: "emotional",
        readTime: "3 min",
      },
      {
        id: "em4",
        title: "Dealing with bullying",
        preview: "What's happening to you is not okay — and it's not your fault.",
        content: "If someone is repeatedly hurting you — in words, actions, or online — that is bullying. And it is not your fault.\n\nBullies target others because of something happening inside themselves — pain, insecurity, a need for control. Their cruelty is a reflection of them, not of your value.\n\nWhat to do:\n• Tell a trusted adult: parent, teacher, school counselor\n• Document it if it's online: screenshot with date and time\n• Don't engage online — block and report\n• Stick close to people who make you feel safe\n• Know that this situation is temporary — your life is long\n\nYou deserve to feel safe. If you're being hurt and don't know what to do, please reach out to an adult today.",
        category: "emotional",
        readTime: "3 min",
      },
      {
        id: "em5",
        title: "When you feel sad for no reason",
        preview: "Low moods come and go — and sometimes they don't need a reason.",
        content: "Sometimes you wake up and everything just feels gray. No dramatic reason. Nothing specific happened. You just feel heavy and low.\n\nThis happens to almost everyone. Moods fluctuate — they're influenced by hormones, sleep, sunlight, nutrition, and things happening in your subconscious.\n\nWhat to do on low days:\n• Don't fight it — accept that today is a low day\n• Do one tiny thing: drink water, go outside for 10 min, shower\n• Be gentler with yourself than you would be on a good day\n• Avoid big decisions when you're low\n• Connect with someone, even just a text\n\nIf low moods last for more than two weeks and affect your daily life, please speak to a doctor. That's when it becomes something that needs real support.",
        category: "emotional",
        readTime: "2 min",
      },
      {
        id: "em6",
        title: "How to ask for help",
        preview: "Reaching out takes courage — here's how to do it.",
        content: "The hardest part of getting help is often just starting the conversation. It can feel embarrassing, like you're burdening someone, or like your problem isn't big enough to talk about.\n\nBut asking for help is one of the bravest things you can do.\n\nHow to start:\n• 'Can I talk to you about something? I've been struggling lately.'\n• 'I've been feeling overwhelmed and I don't know who to talk to.'\n• 'I need some support. Is now a good time?'\n\nWho to ask:\n• A parent or trusted family member\n• A school counselor\n• A trusted teacher\n• A helpline (many countries have free teen helplines)\n\nYou don't need to have all the words figured out. Just say: I need help. That's enough to start.",
        category: "emotional",
        readTime: "2 min",
      },
    ],
  },
];
