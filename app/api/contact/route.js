import { NextResponse } from "next/server";
import { Resend } from "resend";

const CONTACT_RECIPIENT = "info@velttech.org";
const CONTACT_SENDER = "Velttech <noreply@velttech.org>";

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY");

      return NextResponse.json(
        { error: "Server email configuration is missing." },
        { status: 500 }
      );
    }

    const { name, email, phone, service, message } = await request.json();

    if (!name || !email || !phone || !service || !message) {
      return NextResponse.json(
        { error: "Please complete all fields before sending your message." },
        { status: 400 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error } = await resend.emails.send({
      from: CONTACT_SENDER,
      to: CONTACT_RECIPIENT,
      replyTo: email,
      subject: "New Contact Form Submission from Velttech Website",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
          <p><strong>Service Interest:</strong> ${escapeHtml(service)}</p>
          <p><strong>Message:</strong></p>
          <p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Contact form error:", error);

      return NextResponse.json(
        { error: "We could not send your message right now. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);

    return NextResponse.json(
      { error: "We could not send your message right now. Please try again." },
      { status: 500 }
    );
  }
}