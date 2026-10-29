import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

// Load credentials from environment or .env file fallback
export function getCredentials() {
  let user = process.env.GMAIL_USER || process.env.SMTP_USER || "parivattan@gmail.com";
  let pass = (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || "dgcb doys ctbm uwst").replace(/\s+/g, "");

  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      content.split("\n").forEach((line) => {
        const parts = line.split("=");
        if (parts.length >= 2 && !line.trim().startsWith("#")) {
          const k = parts[0].trim();
          const v = parts.slice(1).join("=").trim();
          if (k === "GMAIL_USER" || k === "SMTP_USER") user = v;
          if (k === "GMAIL_APP_PASSWORD" || k === "SMTP_PASS") pass = v.replace(/\s+/g, "");
        }
      });
    }
  } catch (e) {}

  return { user, pass };
}

export function createTransporter() {
  const { user, pass } = getCredentials();
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export function getAdmissionHtml(params) {
  const name = params.studentName || params.name || "Student";
  const course = params.courseName || params.course || "Course";
  const batch = params.batch || "Regular Batch";
  const timing = params.timing || "Scheduled Hours";
  const amount = params.amount || params.totalAmount || "0";
  const prn = params.prn || params.registrationId || "PMF-" + Date.now().toString().slice(-6);

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07);">
      <div style="background: linear-gradient(135deg, #24312d 0%, #15201d 100%); padding: 32px 24px; text-align: center; border-bottom: 4px solid #b5623b;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">PARIVATTAN MISSION FOUNDATION</h1>
        <p style="color: #e5a37f; margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">Center for Foreign Languages & Skill Transformation</p>
      </div>

      <div style="padding: 32px 28px; color: #24312d;">
        <div style="display: inline-block; background-color: #ecfdf5; color: #065f46; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; border: 1px solid #a7f3d0;">
          ✓ Admission Confirmed & Fee Received
        </div>

        <h2 style="font-size: 20px; margin: 0 0 12px 0; color: #1e293b;">Dear ${name},</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
          Congratulations! Your admission to <strong>${course}</strong> has been officially confirmed at Parivattan Mission Foundation.
        </p>

        <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 45%;">Student PRN:</td>
              <td style="padding: 8px 0; font-weight: bold; font-family: monospace; font-size: 15px; color: #b5623b;">${prn}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Course Name:</td>
              <td style="padding: 8px 0; font-weight: bold; color: #1e293b;">${course}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Batch Schedule:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #1e293b;">${batch}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Batch Timing:</td>
              <td style="padding: 8px 0; font-weight: 500; color: #475569;">${timing}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Total Amount Paid:</td>
              <td style="padding: 8px 0; font-weight: bold; font-size: 16px; color: #059669;">₹${amount} (Confirmed)</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Date & Time:</td>
              <td style="padding: 8px 0; color: #475569;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px; margin-bottom: 24px; font-size: 13px; color: #1e40af; line-height: 1.5;">
          <strong>Student Portal Access:</strong>
          <p style="margin: 4px 0 0 0;">Please keep your Student PRN (<strong>${prn}</strong>) safe. You can use it to login to the Parivattan Student Portal to access study materials, track attendance, and download your course certificate.</p>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0;">
          For any academic queries or batch orientation details, reach us at <a href="mailto:contact@parivattan.org" style="color: #b5623b; text-decoration: none; font-weight: 600;">contact@parivattan.org</a> or call +91 7820831901.
        </p>
      </div>

      <div style="background-color: #f1f5f9; padding: 18px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0;">Parivattan Mission Foundation · Center for Education & Social Transformation</p>
        <p style="margin: 4px 0 0 0; font-size: 11px;">Registered Section 8 Non-Profit Organization · NITI Aayog NGO Darpan</p>
      </div>
    </div>
  `;
}

export function getDonationHtml(params) {
  const name = params.donorName || params.name || "Generous Donor";
  const amount = params.amount || "100";
  const cause = params.cause || "Social & Education Empowerment";
  const receiptNo = params.receiptNo || "PMF-DON-" + Date.now().toString().slice(-6);
  const paymentId = params.paymentId || "ONLINE_PAYMENT";
  const pan = params.pan || "N/A";

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07);">
      <div style="background: linear-gradient(135deg, #24312d 0%, #15201d 100%); padding: 32px 24px; text-align: center; border-bottom: 4px solid #b5623b;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">PARIVATTAN MISSION FOUNDATION</h1>
        <p style="color: #e5a37f; margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">Registered Under Section 8 Company · NITI Aayog NGO Darpan</p>
      </div>

      <div style="padding: 32px 28px; color: #24312d;">
        <div style="display: inline-block; background-color: #ecfdf5; color: #065f46; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; border: 1px solid #a7f3d0;">
          ✓ Official Donation Receipt Issued
        </div>

        <h2 style="font-size: 20px; margin: 0 0 12px 0; color: #1e293b;">Respected ${name},</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">
          We sincerely express our deepest gratitude for your noble contribution of <strong>₹${amount}</strong> towards Parivattan Mission Foundation. Your support powers vital rural student scholarships, overseas language skilling, and youth empowerment.
        </p>

        <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; width: 45%;">Receipt Number:</td>
              <td style="padding: 8px 0; font-weight: bold; font-family: monospace; font-size: 15px; color: #b5623b;">${receiptNo}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Donation Amount:</td>
              <td style="padding: 8px 0; font-weight: bold; font-size: 18px; color: #059669;">₹${amount} (Confirmed)</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Supported Cause:</td>
              <td style="padding: 8px 0; font-weight: 600; color: #1e293b;">${cause}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Payment / Txn ID:</td>
              <td style="padding: 8px 0; font-family: monospace; color: #475569;">${paymentId}</td>
            </tr>
            ${pan && pan !== "N/A" ? `<tr><td style="padding: 8px 0; color: #64748b;">Donor PAN:</td><td style="padding: 8px 0; font-weight: 600; font-family: monospace;">${pan}</td></tr>` : ""}
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Date & Time:</td>
              <td style="padding: 8px 0; color: #475569;">${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px; margin-bottom: 24px; font-size: 13px; color: #1e40af; line-height: 1.5;">
          <strong>80G Income Tax Exemption:</strong>
          <p style="margin: 4px 0 0 0;">Donations made to Parivattan Mission Foundation are eligible for tax deduction benefits under Section 80G of the Income Tax Act, 1961. Please preserve this receipt for your tax filings.</p>
        </div>

        <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0;">
          For inquiries or 80G certificate copies, contact us at <a href="mailto:contact@parivattan.org" style="color: #b5623b; text-decoration: none; font-weight: 600;">contact@parivattan.org</a> or +91 7820831901.
        </p>
      </div>

      <div style="background-color: #f1f5f9; padding: 18px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
        <p style="margin: 0;">Parivattan Mission Foundation · Center for Education & Social Transformation</p>
        <p style="margin: 4px 0 0 0; font-size: 11px;">Registered Section 8 Non-Profit Organization · NITI Aayog NGO Darpan</p>
      </div>
    </div>
  `;
}

const sentEmailIdempotency = new Map();

export async function handleSendEmail(params) {
  const type = (params.type || "").toLowerCase();
  const isDonation = type === "donation" || Boolean(params.donorEmail);

  const recipient = isDonation
    ? (params.donorEmail || params.email || "").trim()
    : (params.studentEmail || params.email || "").trim();

  if (!recipient || !recipient.includes("@")) {
    return { success: false, error: "Missing or invalid recipient email address." };
  }

  const course = params.courseName || params.course || "Course";
  const prn = params.prn || params.registrationId || "";

  // Idempotency: Prevent duplicate email within 3 minutes for identical recipient + course/prn
  const idempotencyKey = `${recipient.toLowerCase()}:${isDonation ? (params.paymentId || params.receiptNo || "don") : `${course}:${prn}`}`;
  const now = Date.now();
  const lastSent = sentEmailIdempotency.get(idempotencyKey);
  if (lastSent && now - lastSent.time < 3 * 60 * 1000) {
    console.log(`[SMTP Dispatch] Skipping duplicate email to ${recipient} (already sent ${Math.round((now - lastSent.time) / 1000)}s ago)`);
    return { success: true, messageId: lastSent.messageId, recipient, duplicate: true };
  }

  const { user } = getCredentials();
  const transporter = createTransporter();

  let subject = "";
  let html = "";

  if (isDonation) {
    const amount = params.amount || "100";
    const receiptNo = params.receiptNo || "PMF-DON-" + Date.now().toString().slice(-6);
    subject = `🙏 Donation Receipt: ₹${amount} | ${receiptNo} - Parivattan Mission Foundation`;
    html = getDonationHtml(params);
  } else {
    const displayPrn = prn || "PMF-" + Date.now().toString().slice(-6);
    subject = `🎓 Admission Confirmation: ${course} (PRN: ${displayPrn}) - Parivattan Mission Foundation`;
    html = getAdmissionHtml(params);
  }

  console.log(`[SMTP Dispatch] Sending ${isDonation ? "donation receipt" : "course admission"} email to: ${recipient} via ${user}...`);

  const info = await transporter.sendMail({
    from: `"Parivattan Mission Foundation" <${user}>`,
    to: recipient,
    subject,
    html,
    replyTo: "contact@parivattan.org",
  });

  sentEmailIdempotency.set(idempotencyKey, { time: now, messageId: info.messageId });
  console.log(`[SMTP Dispatch] Successfully sent to ${recipient}! Message ID: ${info.messageId}`);
  return { success: true, messageId: info.messageId, recipient };
}

export default handleSendEmail;
