import { NextResponse } from "next/server";
import { Resend } from "resend";

const CONTACT_RECIPIENT = "info@velttech.org";
const CONTACT_SENDER = "Velttech <noreply@velttech.org>";
const isDevelopment = process.env.NODE_ENV !== "production";

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
      return Response.json(
        { error: "Server email configuration is missing." },
        { status: 500 },
      );
    }

    const { name, email, phone, service, message } = await request.json();

    if (!name || !email || !phone || !service || !message) {
      return NextResponse.json(
        { error: "Please complete all fields before sending your message." },
        { status: 400 },
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const submittedAt = new Date().toLocaleString("en-GB", {
      dateStyle: "full",
      timeStyle: "short",
      timeZone: "Africa/Accra",
    });

    const { error } = await resend.emails.send({
      from: CONTACT_SENDER,
      to: CONTACT_RECIPIENT,
      replyTo: email,
      subject: "New Contact Form Submission from Velttech Website",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;color:#0F172A;">
          <div style="background:#0F172A;color:#ffffff;padding:24px;border-radius:16px 16px 0 0;">
            <h1 style="margin:0;font-size:24px;">New Contact Form Submission</h1>
            <p style="margin:8px 0 0;color:#CBD5E1;">Velttech Website</p>
          </div>
          <div style="border:1px solid #E2E8F0;border-top:0;padding:24px;border-radius:0 0 16px 16px;">
            <table style="width:100%;border-collapse:collapse;">
              <tbody>
                <tr><td style="padding:10px 0;font-weight:bold;">Name</td><td style="padding:10px 0;">${escapeHtml(name)}</td></tr>
                <tr><td style="padding:10px 0;font-weight:bold;">Email</td><td style="padding:10px 0;">${escapeHtml(email)}</td></tr>
                <tr><td style="padding:10px 0;font-weight:bold;">Phone</td><td style="padding:10px 0;">${escapeHtml(phone)}</td></tr>
                <tr><td style="padding:10px 0;font-weight:bold;">Service Interest</td><td style="padding:10px 0;">${escapeHtml(service)}</td></tr>
                <tr><td style="padding:10px 0;font-weight:bold;">Submitted</td><td style="padding:10px 0;">${escapeHtml(submittedAt)}</td></tr>
              </tbody>
            </table>
            <div style="margin-top:24px;">
              <p style="margin:0 0 8px;font-weight:bold;">Message</p>
              <div style="white-space:pre-wrap;line-height:1.6;background:#F8FAFC;border-radius:12px;padding:16px;">${escapeHtml(message)}</div>
            </div>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Contact form error:", error);
      return NextResponse.json(
        {
          error: isDevelopment
            ? error.message || "Resend could not send the email."
            : "We could not send your message right now. Please try again.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      {
        error: isDevelopment
          ? error.message || "Unexpected contact form error."
          : "We could not send your message right now. Please try again.",
      },
      { status: 500 },
    );
  }
}
