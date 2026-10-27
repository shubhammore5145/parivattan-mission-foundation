/**
 * ============================================================================
 * PARIVATTAN MISSION FOUNDATION - UNIFIED EMAIL NOTIFICATION SERVICE
 * ============================================================================
 * Automatically dispatches official branded confirmation & receipt emails for:
 * 1. Course Admissions (with Student PRN & Batch details)
 * 2. Charitable Donations (with Receipt No., 80G Tax info & Cause details)
 */

export const GOOGLE_APPS_SCRIPT_EMAIL_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_COURSE_AUTO_EMAIL_WEBAPP_URL) ||
  "https://script.google.com/macros/s/AKfycbzANZBAlHO8J4zz9N6CO1_xTME4skK8HCT_Uz0jd1DlMTXPYCzDA4UREgdf9cYYAPk/exec";

export interface CourseAdmissionEmailParams {
  studentName: string;
  studentEmail: string;
  courseName: string;
  phone?: string;
  batch?: string;
  timing?: string;
  totalAmount?: number | string;
  registrationId?: string;
  prn?: string;
}

export interface DonationReceiptEmailParams {
  donorName: string;
  donorEmail: string;
  amount: number | string;
  cause: string;
  paymentId: string;
  receiptNo: string;
  donorPhone?: string;
  pan?: string;
}

/**
 * 1. Sends Course Admission Confirmation Email
 */
export async function sendCourseAdmissionEmail(
  params: CourseAdmissionEmailParams
): Promise<{ success: boolean; message: string }> {
  const { studentName, studentEmail, courseName } = params;

  if (!studentEmail || !studentEmail.includes("@")) {
    console.warn("[EmailService] Invalid recipient email:", studentEmail);
    return { success: false, message: "Invalid student email address." };
  }

  const payload = {
    type: "admission",
    studentEmail: studentEmail.trim(),
    studentName: studentName.trim(),
    courseName: courseName.trim(),
    email: studentEmail.trim(),
    name: studentName.trim(),
    course: courseName.trim(),
    phone: params.phone || "",
    batch: params.batch || "",
    timing: params.timing || "",
    amount: params.totalAmount ? String(params.totalAmount) : "",
    prn: params.prn || params.registrationId || "",
    timestamp: new Date().toISOString(),
  };

  console.log("[EmailService] Sending admission confirmation to:", studentEmail, "for course:", courseName);

  // Try direct local/server API endpoint first (with 8s timeout)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        console.log("[EmailService] Direct SMTP email sent successfully!");
        return { success: true, message: "Email sent via SMTP." };
      }
    } else if (res.status === 429) {
      const data = await res.json().catch(() => ({}));
      console.warn("[EmailService] Email rate limit notice:", data.error);
    }
  } catch (e: any) {
    console.warn("[EmailService] Primary /api/send-email attempt notice:", e?.message);
  }

  // Secondary fallback: Try absolute production origin endpoint if relative failed
  try {
    const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    if (!isLocal) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch("https://www.parivattan.org/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          console.log("[EmailService] Production SMTP email sent successfully!");
          return { success: true, message: "Email sent via production SMTP." };
        }
      }
    }
  } catch (secErr: any) {
    console.warn("[EmailService] Secondary email dispatch notice:", secErr?.message);
  }

  // Fallback: Google Apps Script Web App
  try {
    const queryParams = new URLSearchParams({
      type: "admission",
      studentEmail: payload.studentEmail,
      studentName: payload.studentName,
      courseName: payload.courseName,
      email: payload.email,
      name: payload.name,
      course: payload.course,
      phone: payload.phone,
      batch: payload.batch,
      timing: payload.timing,
      amount: payload.amount,
      prn: payload.prn,
    }).toString();

    const getUrl = `${GOOGLE_APPS_SCRIPT_EMAIL_URL}?${queryParams}`;

    fetch(getUrl, { method: "GET", mode: "no-cors" }).catch(() => {});
    fetch(GOOGLE_APPS_SCRIPT_EMAIL_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    }).catch(() => {});

    return {
      success: true,
      message: "Admission confirmation email dispatched.",
    };
  } catch (error) {
    console.error("[EmailService] Failed to dispatch admission email:", error);
    return { success: false, message: "Failed to dispatch email." };
  }
}

/**
 * 2. Sends Donation Receipt & Thank You Email
 */
export async function sendDonationReceiptEmail(
  params: DonationReceiptEmailParams
): Promise<{ success: boolean; message: string }> {
  const { donorName, donorEmail, amount, cause, paymentId, receiptNo } = params;

  if (!donorEmail || !donorEmail.includes("@")) {
    console.warn("[EmailService] Invalid donor email:", donorEmail);
    return { success: false, message: "Invalid donor email address." };
  }

  const payload = {
    type: "donation",
    donorEmail: donorEmail.trim(),
    donorName: donorName.trim(),
    amount: String(amount),
    cause: cause.trim(),
    paymentId: paymentId.trim(),
    receiptNo: receiptNo.trim(),
    phone: params.donorPhone || "",
    pan: params.pan || "N/A",
    email: donorEmail.trim(),
    name: donorName.trim(),
    timestamp: new Date().toISOString(),
  };

  console.log("[EmailService] Sending donation receipt email to:", donorEmail, "for amount: ₹" + amount);

  // Try direct local/server API endpoint first (with 8s timeout)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        console.log("[EmailService] Direct SMTP donation receipt email sent successfully!");
        return { success: true, message: "Donation receipt sent via SMTP." };
      }
    } else if (res.status === 429) {
      const data = await res.json().catch(() => ({}));
      console.warn("[EmailService] Donation email rate limit notice:", data.error);
    }
  } catch (e: any) {
    console.warn("[EmailService] Primary /api/send-email donation attempt notice:", e?.message);
  }

  // Secondary fallback: Try absolute production origin endpoint if relative failed
  try {
    const isLocal = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    if (!isLocal) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch("https://www.parivattan.org/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          console.log("[EmailService] Production SMTP donation email sent successfully!");
          return { success: true, message: "Donation receipt sent via production SMTP." };
        }
      }
    }
  } catch (secErr: any) {
    console.warn("[EmailService] Secondary donation email dispatch notice:", secErr?.message);
  }

  // Fallback: Google Apps Script Web App
  try {
    const queryParams = new URLSearchParams({
      type: "donation",
      donorEmail: payload.donorEmail,
      donorName: payload.donorName,
      amount: payload.amount,
      cause: payload.cause,
      paymentId: payload.paymentId,
      receiptNo: payload.receiptNo,
      phone: payload.phone,
      pan: payload.pan,
      email: payload.email,
      name: payload.name,
    }).toString();

    const getUrl = `${GOOGLE_APPS_SCRIPT_EMAIL_URL}?${queryParams}`;

    fetch(getUrl, { method: "GET", mode: "no-cors" }).catch(() => {});
    fetch(GOOGLE_APPS_SCRIPT_EMAIL_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    }).catch(() => {});

    return {
      success: true,
      message: "Donation receipt email dispatched.",
    };
  } catch (error) {
    console.error("[EmailService] Failed to dispatch donation email:", error);
    return { success: false, message: "Failed to dispatch email." };
  }
}
