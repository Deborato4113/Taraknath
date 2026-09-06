// Server-side route: receives the contact form submission and sends a
// real email — including the attached file — via Resend's API.
//
// SETUP (one-time, ~5 minutes):
// 1. Create a free account at https://resend.com
// 2. Go to API Keys → create a new key, copy it
// 3. In your project root, create a file named `.env.local` containing:
//      RESEND_API_KEY=re_your_key_here
// 4. Restart `npm run dev` after adding the key
// 5. If deploying (Vercel, etc.), add RESEND_API_KEY as an environment
//    variable in your hosting provider's project settings too
//
// NOTE ON SENDING ADDRESS: without verifying your own domain on Resend,
// you can only send FROM their shared address (onboarding@resend.dev)
// and only TO the email address you signed up to Resend with. This is
// fine for receiving enquiries at your own inbox. If you later want to
// send to a different address, verify a domain in the Resend dashboard
// (still free) and swap the "from" address below to something like
// "Taraknath Website <contact@yourdomain.com>".

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TO_EMAIL = "satyaki.ghosh@zenydata.com";
const FROM_EMAIL = "Taraknath Website <onboarding@resend.dev>";

export async function POST(request) {
  if (!RESEND_API_KEY) {
    return Response.json(
      { error: "Server is missing RESEND_API_KEY. See app/api/contact/route.js for setup steps." },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const firstName = formData.get("firstName") || "";
    const lastName = formData.get("lastName") || "";
    const email = formData.get("email") || "";
    const phone = formData.get("phone") || "";
    const message = formData.get("message") || "";
    const file = formData.get("attachment"); // a File, or null

    const html = `
      <h2>New enquiry from the Taraknath website</h2>
      <p><strong>Name:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Message:</strong><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
    `;

    const payload = {
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      reply_to: email || undefined,
      subject: `New enquiry from ${firstName} ${lastName} — Taraknath website`,
      html,
    };

    // Attach the file (if any) as a real, downloadable email attachment
    if (file && typeof file === "object" && "arrayBuffer" in file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      payload.attachments = [
        {
          filename: file.name || "attachment",
          content: buffer.toString("base64"),
        },
      ];
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend error:", errText);
      return Response.json({ error: "Failed to send email" }, { status: 502 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Unexpected server error" }, { status: 500 });
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
