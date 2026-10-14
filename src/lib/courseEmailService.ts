/**
 * ============================================================================
 * Course & Donation Auto-Email Notification Service
 * Re-exports unified notificationEmailService methods
 * ============================================================================
 */

export {
  GOOGLE_APPS_SCRIPT_EMAIL_URL,
  sendCourseAdmissionEmail,
  sendDonationReceiptEmail,
  type CourseAdmissionEmailParams,
  type DonationReceiptEmailParams,
} from "./notificationEmailService";
