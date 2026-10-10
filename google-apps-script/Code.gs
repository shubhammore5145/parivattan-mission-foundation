/**
 * ============================================================================
 * PARIVATTAN MISSION FOUNDATION - OFFICIAL COURSE ADMISSION EMAIL SENDER
 * ============================================================================
 * 
 * Deployment Instructions (फक्त २ मिनिटांचे सोपे काम):
 * 1. तुमच्या ब्राउझरमध्ये https://script.google.com उघडा (Google Account ने लॉगिन करा).
 * 2. वर डावीकडे "+ New project" बटणावर क्लिक करा.
 * 3. तिथे असणारा जुना कोड खोडून हा संपूर्ण कोड (Code.gs) पेस्ट करा.
 * 4. वर उजवीकडे निळ्या रंगाच्या "Deploy" बटणावर क्लिक करा -> "New deployment" निवडा.
 * 5. डाव्या बाजूला असणाऱ्या Gear चिन्हावर (⚙️) क्लिक करा -> "Web app" निवडा.
 * 6. खालील सेटिंग्ज तपासा:
 *    - Description: "Parivattan Admission Email Service"
 *    - Execute as: "Me" (तुमचा ईमेल)
 *    - Who has access: "Anyone" (हे सर्वात महत्त्वाचे आहे! 'Anyone' निवडा).
 * 7. "Deploy" बटणावर क्लिक करा.
 * 8. "Authorize access" विचारल्यास तुमच्या Google खात्याला परवानगी द्या (Advanced -> Go to ... (unsafe) वर क्लिक करून Allow करा).
 * 9. मिळणारा Web app URL (ज्याच्या शेवटी /exec असेल) कॉपी करा.
 * 10. प्रोजेक्टमधील .env फाईलमध्ये VITE_COURSE_AUTO_EMAIL_WEBAPP_URL च्या पुढे तो URL पेस्ट करा!
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
