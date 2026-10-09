/**
 * Google Apps Script Course Auto-Email Service
 * Automatically triggers student admission confirmation email via Google Apps Script Web App
 */

export const GOOGLE_APPS_SCRIPT_EMAIL_URL =
  import.meta.env.VITE_COURSE_AUTO_EMAIL_WEBAPP_URL ||
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

/**
 * Sends course confirmation email to the student via Google Apps Script Web App
 */
export async function sendCourseAdmissionEmail(
  params: CourseAdmissionEmailParams
): Promise<{ success: boolean; message: string }> {
  const { studentName, studentEmail, courseName } = params;

  if (!studentEmail || !studentEmail.includes("@")) {
    console.warn("[CourseAutoEmail] Invalid or missing student email:", studentEmail);
    return { success: false, message: "Invalid student email address." };
  }

  const payload = {
    // Primary parameter names matching Google Apps Script Code.gs
    studentEmail: studentEmail.trim(),
    studentName: studentName.trim(),
    courseName: courseName.trim(),
    // Standard aliases for safety
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

  console.log("[CourseAutoEmail] Sending confirmation email to:", studentEmail, "for course:", courseName);

  try {
    // Build query params for GET request
    const queryParams = new URLSearchParams({
      studentEmail: payload.studentEmail,
      studentName: payload.studentName,
      courseName: payload.courseName,
      email: payload.email,
      name: payload.name,
      course: payload.course,
      phone: payload.phone,
      batch: payload.batch,
      amount: payload.amount,
      prn: payload.prn,
    }).toString();

    const getUrl = `${GOOGLE_APPS_SCRIPT_EMAIL_URL}?${queryParams}`;

    // 1. Fire GET request with no-cors to avoid browser CORS redirects issues
    fetch(getUrl, {
      method: "GET",
      mode: "no-cors",
      headers: {
        "Accept": "application/json",
      },
    }).catch((err) => {
      console.warn("[CourseAutoEmail] GET dispatch notice:", err);
    });

    // 2. Also dispatch POST request with text/plain (avoids CORS preflight)
    fetch(GOOGLE_APPS_SCRIPT_EMAIL_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.warn("[CourseAutoEmail] POST dispatch notice:", err);
    });

    // 3. Fallback: try navigator.sendBeacon if available
    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: "text/plain" });
        navigator.sendBeacon(GOOGLE_APPS_SCRIPT_EMAIL_URL, blob);
      }
    } catch (beaconErr) {
      // ignore
    }

    return {
      success: true,
      message: "Course admission confirmation email dispatched successfully.",
    };
  } catch (error) {
    console.error("[CourseAutoEmail] Failed to send email:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to dispatch email.",
    };
  }
}
