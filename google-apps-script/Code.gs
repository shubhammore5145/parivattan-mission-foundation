/**
 * ============================================================================
 * PARIVATTAN MISSION FOUNDATION - OFFICIAL EMAIL NOTIFICATION SERVICE
 * Handles Automatic Emails for:
 * 1. Course Admissions (with Student PRN & Schedule)
 * 2. Charitable Donations (with Receipt No. & 80G Tax Info)
 * ============================================================================
 * 
 * Deployment Instructions (२ मिनिटांचे सोपे काम):
 * 1. https://script.google.com उघडा (Google Account ने लॉगिन करा).
 * 2. "+ New project" वर क्लिक करा.
 * 3. जुना कोड काढून हा संपूर्ण कोड (Code.gs) पेस्ट करा.
 * 4. वर उजवीकडे "Deploy" -> "New deployment" -> Gear चिन्हावर (⚙️) "Web app" निवडा.
 * 5. Settings:
 *    - Description: "Parivattan Email Service"
 *    - Execute as: "Me" (तुमचा ईमेल)
 *    - Who has access: "Anyone" (हे नक्की 'Anyone' निवडा)
 * 6. "Deploy" -> "Authorize access" (Advanced -> Go to ... (unsafe) -> Allow).
 * 7. मिळणारा Web app URL कॉपी करा आणि .env मध्ये VITE_COURSE_AUTO_EMAIL_WEBAPP_URL समोर टाका!
 */

function doGet(e) {
  return handleEmailRequest(e);
}

function doPost(e) {
  return handleEmailRequest(e);
}

function handleEmailRequest(e) {
  try {
    var params = {};

    // 1. Check GET query parameters
    if (e && e.parameter) {
      params = e.parameter;
    }

    // 2. Check POST JSON body
    if (e && e.postData && e.postData.contents) {
      try {
        var postJson = JSON.parse(e.postData.contents);
        for (var key in postJson) {
          if (!params[key]) {
            params[key] = postJson[key];
          }
        }
      } catch (jsonErr) {}
    }

    var type = (params.type || "").toLowerCase();

    // =========================================================================
    // CASE A: CHARITABLE DONATION RECEIPT EMAIL
    // =========================================================================
    if (type === "donation" || params.donorEmail) {
      var donorEmail = params.donorEmail || params.email || "";
      var donorName = params.donorName || params.name || "Generous Donor";
      var amount = params.amount || "100";
      var cause = params.cause || "Social & Education Empowerment";
      var receiptNo = params.receiptNo || ("PMF-DON-" + new Date().getTime().toString().slice(-6));
      var paymentId = params.paymentId || "ONLINE_PAYMENT";
      var pan = params.pan || "N/A";

      if (!donorEmail || donorEmail.indexOf("@") === -1) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: "Missing or invalid recipient donor email."
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var donationSubject = "🙏 Donation Receipt: ₹" + amount + " | " + receiptNo + " - Parivattan Mission Foundation";

      var donationHtml = '<div style="font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">' +
        '<div style="background: linear-gradient(135deg, #24312d 0%, #15201d 100%); padding: 32px 24px; text-align: center; border-bottom: 4px solid #b5623b;">' +
          '<h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 0.5px;">PARIVATTAN MISSION FOUNDATION</h1>' +
          '<p style="color: #e5a37f; margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">Registered Under Section 8 Company · NITI Aayog NGO Darpan</p>' +
        '</div>' +
        '<div style="padding: 32px 28px; color: #24312d;">' +
          '<div style="display: inline-block; background-color: #ecfdf5; color: #065f46; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; border: 1px solid #a7f3d0;">✓ Official Donation Receipt Issued</div>' +
          '<h2 style="font-size: 20px; margin: 0 0 12px 0; color: #1e293b;">Respected ' + donorName + ',</h2>' +
          '<p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">We sincerely express our deepest gratitude for your noble contribution of <strong>₹' + amount + '</strong> towards Parivattan Mission Foundation. Your support powers vital rural student scholarships, overseas language skilling, and youth empowerment.</p>' +
          '<div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 24px;">' +
            '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">' +
              '<tr><td style="padding: 8px 0; color: #64748b; width: 45%;">Receipt Number:</td><td style="padding: 8px 0; font-weight: bold; font-family: monospace; font-size: 15px; color: #b5623b;">' + receiptNo + '</td></tr>' +
              '<tr><td style="padding: 8px 0; color: #64748b;">Donation Amount:</td><td style="padding: 8px 0; font-weight: bold; font-size: 18px; color: #059669;">₹' + amount + ' (Confirmed)</td></tr>' +
              '<tr><td style="padding: 8px 0; color: #64748b;">Supported Cause:</td><td style="padding: 8px 0; font-weight: 600; color: #1e293b;">' + cause + '</td></tr>' +
              '<tr><td style="padding: 8px 0; color: #64748b;">Payment / Txn ID:</td><td style="padding: 8px 0; font-family: monospace; color: #475569;">' + paymentId + '</td></tr>' +
              (pan && pan !== "N/A" ? '<tr><td style="padding: 8px 0; color: #64748b;">Donor PAN:</td><td style="padding: 8px 0; font-weight: 600; font-family: monospace;">' + pan + '</td></tr>' : '') +
              '<tr><td style="padding: 8px 0; color: #64748b;">Date & Time:</td><td style="padding: 8px 0; color: #475569;">' + new Date().toLocaleString() + '</td></tr>' +
            '</table>' +
          '</div>' +
          '<div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px; margin-bottom: 24px; font-size: 13px; color: #1e40af; line-height: 1.5;">' +
            '<strong>80G Income Tax Exemption:</strong>' +
            '<p style="margin: 4px 0 0 0;">Donations made to Parivattan Mission Foundation are eligible for tax deduction benefits under Section 80G of the Income Tax Act, 1961. Please preserve this receipt for your tax filings.</p>' +
          '</div>' +
          '<p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0;">For inquiries or official 80G certificate copies, please contact us at <a href="mailto:contact@parivattan.org" style="color: #b5623b; text-decoration: none; font-weight: 600;">contact@parivattan.org</a> or +91 7820831901.</p>' +
        '</div>' +
        '<div style="background-color: #f1f5f9; padding: 18px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">' +
          '<p style="margin: 0;">Parivattan Mission Foundation · Center for Education & Social Transformation</p>' +
        '</div>' +
      '</div>';

      MailApp.sendEmail({
        to: donorEmail,
        subject: donationSubject,
        htmlBody: donationHtml,
        name: "Parivattan Mission Foundation",
        replyTo: "contact@parivattan.org"
      });

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: "Donation receipt email dispatched successfully to " + donorEmail,
        receiptNo: receiptNo
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // =========================================================================
    // CASE B: COURSE ADMISSION CONFIRMATION EMAIL
    // =========================================================================
    var studentEmail = params.studentEmail || params.email || "";
    var studentName = params.studentName || params.name || "Student";
    var courseName = params.courseName || params.course || "Foreign Language Course";
    var prn = params.prn || params.registrationId || "PMF2026-PENDING";
    var batch = params.batch || "Scheduled Batch";
    var timing = params.timing || "As per timetable";
    var amount = params.amount || "";
    var phone = params.phone || "";

    if (!studentEmail || studentEmail.indexOf("@") === -1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "Missing or invalid recipient email address."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var subject = "🎉 Admission Confirmed: " + courseName + " | PRN: " + prn + " - Parivattan Mission Foundation";

    var htmlBody = '<div style="font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">' +
      '<div style="background: linear-gradient(135deg, #24312d 0%, #15201d 100%); padding: 32px 24px; text-align: center; border-bottom: 4px solid #b5623b;">' +
        '<h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 0.5px;">PARIVATTAN MISSION FOUNDATION</h1>' +
        '<p style="color: #e5a37f; margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">Centralized Admission Portal (CAP) · Academic Session 2026-27</p>' +
      '</div>' +
      '<div style="padding: 32px 28px; color: #24312d;">' +
        '<div style="display: inline-block; background-color: #ecfdf5; color: #065f46; font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; border: 1px solid #a7f3d0;">✓ Admission Confirmed & Seat Reserved</div>' +
        '<h2 style="font-size: 20px; margin: 0 0 12px 0; color: #1e293b;">Welcome, ' + studentName + '!</h2>' +
        '<p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">Congratulations! Your admission application for <strong>' + courseName + '</strong> has been successfully verified and registered with Parivattan Mission Foundation.</p>' +
        '<div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; margin-bottom: 24px;">' +
          '<table style="width: 100%; border-collapse: collapse; font-size: 14px;">' +
            '<tr><td style="padding: 8px 0; color: #64748b; width: 45%;">Permanent Reg. No. (PRN):</td><td style="padding: 8px 0; font-weight: bold; font-family: monospace; font-size: 16px; color: #b5623b;">' + prn + '</td></tr>' +
            '<tr><td style="padding: 8px 0; color: #64748b;">Course / Program:</td><td style="padding: 8px 0; font-weight: 600; color: #1e293b;">' + courseName + '</td></tr>' +
            '<tr><td style="padding: 8px 0; color: #64748b;">Allocated Batch:</td><td style="padding: 8px 0; font-weight: 600; color: #1e293b;">' + batch + '</td></tr>' +
            '<tr><td style="padding: 8px 0; color: #64748b;">Class Timings:</td><td style="padding: 8px 0; font-weight: 600; color: #1e293b;">' + timing + '</td></tr>' +
            (amount ? '<tr><td style="padding: 8px 0; color: #64748b;">Total Paid Amount:</td><td style="padding: 8px 0; font-weight: bold; color: #059669;">₹' + amount + ' (Paid)</td></tr>' : '') +
          '</table>' +
        '</div>' +
        '<div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 10px; padding: 16px; margin-bottom: 24px; font-size: 13px; color: #92400e; line-height: 1.5;">' +
          '<strong>महत्त्वाच्या सूचना (Important Instructions):</strong>' +
          '<ul style="margin: 8px 0 0 0; padding-left: 20px;">' +
            '<li>तुमचा PRN नंबर (<strong>' + prn + '</strong>) सुरक्षित ठेवा. पोर्टल लॉगिन आणि परीक्षांसाठी हा आवश्यक आहे.</li>' +
            '<li>विद्यार्थी पोर्टलवर जाऊन तुमचे Digital Identity Card डाउनलोड किंवा प्रिंट करू शकता.</li>' +
            '<li>वर्ग सुरू होण्यापूर्वी ५-१० मिनिटे हजर राहणे आवश्यक आहे.</li>' +
          '</ul>' +
        '</div>' +
        '<p style="font-size: 13px; color: #64748b; line-height: 1.5; margin: 0;">कोणत्याही मदतीसाठी आम्हाला <a href="mailto:info@parivattan.org" style="color: #b5623b; text-decoration: none; font-weight: 600;">info@parivattan.org</a> वर संपर्क साधा.</p>' +
      '</div>' +
      '<div style="background-color: #f1f5f9; padding: 18px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">' +
        '<p style="margin: 0;">© 2026 Parivattan Mission Foundation. All rights reserved.</p>' +
      '</div>' +
    '</div>';

    MailApp.sendEmail({
      to: studentEmail,
      subject: subject,
      htmlBody: htmlBody,
      name: "Parivattan Mission Foundation",
      replyTo: "info@parivattan.org"
    });

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Email dispatched successfully to " + studentEmail,
      prn: prn
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
