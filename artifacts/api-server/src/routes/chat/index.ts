import { Router } from "express";
import { ai } from "@workspace/integrations-gemini-ai";

const chatRouter = Router();

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

const SYSTEM_PROMPT_AR = `أنتِ "Girly Vibes" — مساعدة رقمية لطيفة وداعمة من قناة يوتيوب @girlyvibes0.
شخصيتك: بنت كبيرة حنونة، لطيفة، مرحة، تتكلم بأسلوب بناتي لطيف.
تساعدين البنات المراهقات في: العناية بالبشرة، نصائح الدراسة، بناء الثقة بالنفس، الروتين اليومي، التعامل مع المشاعر، نصائح الجمال والأناقة، التحفيز والتطوير الذاتي.
قواعد مهمة:
- ردي دائماً بالعربية
- استخدمي أسلوب لطيف وبناتي مع إيموجي مناسبة 🌸💖✨
- كوني داعمة وإيجابية دائماً
- لا تعطي نصائح طبية - اقترحي استشارة متخصص
- ردودك قصيرة ومفيدة (3-5 جمل)
- نادي المستخدمة بـ "حبيبتي" أو "قمر"`;

const SYSTEM_PROMPT_EN = `You are "Girly Vibes" — a cute, supportive digital bestie from the YouTube channel @girlyvibes0.
Your personality: warm big sister energy, sweet, fun, speaks in a cute girly way.
You help teen girls with: skincare, study tips, confidence building, daily routines, handling emotions, beauty & style tips, motivation & self-improvement.
Important rules:
- Always reply in English
- Use a cute, girly tone with appropriate emojis 🌸💖✨
- Always be supportive and positive
- Never give medical advice - suggest consulting a professional
- Keep responses short and helpful (3-5 sentences)
- Address the user as "babe" or "bestie"`;

chatRouter.post("/chat", async (req, res) => {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const entry = rateLimitMap.get(clientIp);
    if (entry && now < entry.resetAt) {
      entry.count++;
      if (entry.count > RATE_LIMIT) {
        res.status(429).json({ error: "Too many requests. Please wait a moment." });
        return;
      }
    } else {
      rateLimitMap.set(clientIp, { count: 1, resetAt: now + RATE_WINDOW_MS });
    }

    const { messages, lang } = req.body as {
      messages: { role: string; content: string }[];
      lang: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "messages array is required" });
      return;
    }

    if (messages.length > 30) {
      res.status(400).json({ error: "Too many messages" });
      return;
    }

    const systemPrompt = lang === "ar" ? SYSTEM_PROMPT_AR : SYSTEM_PROMPT_EN;

    const chatMessages = [
      { role: "user" as const, parts: [{ text: systemPrompt }] },
      { role: "model" as const, parts: [{ text: lang === "ar" ? "أهلاً حبيبتي! أنا Girly Vibes 🌸 كيف أقدر أساعدك اليوم؟ ✨" : "Hey bestie! I'm Girly Vibes 🌸 How can I help you today? ✨" }] },
      ...messages.map((m) => ({
        role: (m.role === "assistant" ? "model" : "user") as "model" | "user",
        parts: [{ text: m.content }],
      })),
    ];

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let aborted = false;
    req.on("close", () => { aborted = true; });

    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: chatMessages,
      config: { maxOutputTokens: 8192 },
    });

    for await (const chunk of stream) {
      if (aborted) break;
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    if (!aborted) {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    }
    res.end();
  } catch (error: any) {
    console.error("Chat error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Chat failed" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Something went wrong" })}\n\n`);
      res.end();
    }
  }
});

export default chatRouter;
