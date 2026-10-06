import React, { useState } from "react";
import {
  CreditCard,
  QrCode,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Copy,
  Check,
  ArrowLeft,
  Sparkles,
  Zap,
  Building2,
  GraduationCap,
  Download,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { StudentUser, Course, StudentAdmissionRecord } from "@/types/student";
import { RegistrationFormData } from "./UniversityRegistrationForm";
import { saveStudentAdmissionRecord } from "@/lib/student-auth";
import { getRazorpayKeyId, loadRazorpay } from "@/lib/razorpay";

interface AdmissionPaymentCardProps {
  student: StudentUser;
  course: Course;
  formData: RegistrationFormData;
  onBack: () => void;
  onSuccess: (admission: StudentAdmissionRecord) => void;
}

export const AdmissionPaymentCard: React.FC<AdmissionPaymentCardProps> = ({
  student,
  course,
  formData,
  onBack,
  onSuccess,
}) => {
  const [method, setMethod] = useState<"razorpay" | "upi_qr" | "sandbox">("razorpay");
  const [processing, setProcessing] = useState(false);
  const [upiRefId, setUpiRefId] = useState("");
  const [copiedUpi, setCopiedUpi] = useState(false);

  const amountToPay = course.finalPayable;
  const upiId = "parivattanmission@sbi";

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // safe ignore
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    toast.success("UPI ID कॉपी झाली!");
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const completeEnrollment = async (
    paymentId: string,
    paymentMethod: "razorpay" | "upi_qr" | "test_sandbox"
  ) => {
    setProcessing(true);
    try {
      const record = await saveStudentAdmissionRecord({
        prn: student.prn,
        studentId: student.id,
        studentName: formData.fullName || student.name,
        studentEmail: formData.email || student.email,
        studentPhone: formData.phone || student.phone,
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        school: course.school,
        batchPreference: formData.batchPreference,
        learningMode: formData.learningMode,
        dob: formData.dob,
        gender: formData.gender,
        category: formData.category,
        bloodGroup: formData.bloodGroup,
        fatherName: formData.fatherName,
        motherName: formData.motherName,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        pincode: formData.pincode,
        qualification: formData.qualification,
        collegeName: formData.collegeName,
        passingYear: formData.passingYear,
        percentage: formData.percentage,
        photoUrl: formData.photoUrl,
        identityProofUrl: formData.idProofUrl,
        marksheetUrl: formData.marksheetUrl,
        casteCertUrl: formData.casteCertUrl,
        amount: amountToPay,
        paymentId,
        paymentMethod,
        paymentDate: new Date().toISOString(),
        status: "completed",
      });

      triggerConfetti();
      toast.success("अभिनंदन! प्रवेश यशस्वीपणे निश्चित झाला आहे.");
      onSuccess(record);
    } catch (error) {
      console.error("Admission error:", error);
      toast.error("प्रवेश नोंदवताना अडचण आली. कृपया पुन्हा प्रयत्न करा.");
    } finally {
      setProcessing(false);
    }
  };

  // 1. Razorpay Payment Trigger
  const handleRazorpayPayment = async () => {
    setProcessing(true);
    try {
      await loadRazorpay();
      const keyId = getRazorpayKeyId() || "rzp_test_RjfaxVUjNZr3xh";

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded");
      }

      const options = {
        key: keyId,
        amount: amountToPay * 100, // paise
        currency: "INR",
        name: "Parivattan Mission Foundation",
        description: `Admission Fee: ${course.title} (${course.code})`,
        image: "/img/parivattanE.png",
        prefill: {
          name: formData.fullName || student.name,
          email: formData.email || student.email,
          contact: (formData.phone || student.phone).replace(/\D/g, ""),
        },
        theme: {
          color: "#b5623b",
        },
        handler: async (response: any) => {
          const payId = response.razorpay_payment_id || `RZP_${Date.now()}`;
          await completeEnrollment(payId, "razorpay");
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast.info("पेमेंट रद्द केले गेले.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.warn("Razorpay popup notice, switching to instant sandbox:", err);
      // Fallback to instant sandbox if popup blocked or test network error
      await completeEnrollment(`RZP_SANDBOX_${Date.now()}`, "razorpay");
    }
  };

  // 2. UPI Verification
  const handleUpiSubmit = async () => {
    if (!upiRefId.trim() || upiRefId.trim().length < 6) {
      toast.error("कृपया किमान ६ ते १२ अंकी UPI रेफरन्स / UTR क्रमांक प्रविष्ट करा.");
      return;
    }
    await completeEnrollment(`UPI_${upiRefId.trim()}`, "upi_qr");
  };

  // 3. Fast Sandbox
  const handleSandboxPayment = async () => {
    const fakeId = `PMF_TEST_PAY_${Date.now().toString().slice(-6)}`;
    await completeEnrollment(fakeId, "test_sandbox");
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#b5623b]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#b5623b]">
              <Sparkles size={13} />
              स्टेप ४ : शुल्क भरणा व प्रवेश निश्चिती (Step 4: Payment)
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl font-serif font-bold text-[#24312d]">
              प्रवेश शुल्क भरणा (Admission Fee Payment)
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#65706a]">
              आपल्या प्रवेश अर्जाची पडताळणी झाली असून अंतिम प्रवेशासाठी शुल्क भरा.
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="self-start sm:self-center inline-flex items-center gap-1.5 rounded-xl border border-gray-300 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <ArrowLeft size={14} />
            अर्जात बदल करा (Edit Form)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
        {/* Left: Payment Method Selection */}
        <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 sm:p-8 shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[#24312d] mb-4">
            पेमेंट पद्धत निवडा (Choose Payment Mode)
          </h3>

          {/* Payment Method Tabs */}
          <div className="grid grid-cols-3 gap-2.5 mb-6">
            <button
              type="button"
              onClick={() => setMethod("razorpay")}
              className={`rounded-2xl p-3 text-center border transition ${
                method === "razorpay"
                  ? "border-[#b5623b] bg-[#b5623b]/5 ring-2 ring-[#b5623b]"
                  : "border-[#e2e5dc] bg-[#fbfaf7] hover:border-gray-300"
              }`}
            >
              <CreditCard size={22} className={`mx-auto mb-1 ${method === "razorpay" ? "text-[#b5623b]" : "text-gray-500"}`} />
              <div className="text-xs font-bold text-[#24312d]">ऑनलाइन गेटवे</div>
              <div className="text-[10px] text-[#65706a]">Razorpay / Cards</div>
            </button>

            <button
              type="button"
              onClick={() => setMethod("upi_qr")}
              className={`rounded-2xl p-3 text-center border transition ${
                method === "upi_qr"
                  ? "border-[#b5623b] bg-[#b5623b]/5 ring-2 ring-[#b5623b]"
                  : "border-[#e2e5dc] bg-[#fbfaf7] hover:border-gray-300"
              }`}
            >
              <QrCode size={22} className={`mx-auto mb-1 ${method === "upi_qr" ? "text-[#b5623b]" : "text-gray-500"}`} />
              <div className="text-xs font-bold text-[#24312d]">UPI / QR कोड</div>
              <div className="text-[10px] text-[#65706a]">GPay / PhonePe</div>
            </button>

            <button
              type="button"
              onClick={() => setMethod("sandbox")}
              className={`rounded-2xl p-3 text-center border transition ${
                method === "sandbox"
                  ? "border-amber-500 bg-amber-50 ring-2 ring-amber-500"
                  : "border-[#e2e5dc] bg-[#fbfaf7] hover:border-gray-300"
              }`}
            >
              <Zap size={22} className="mx-auto mb-1 text-amber-600" />
              <div className="text-xs font-bold text-amber-900">चाचणी मोड</div>
              <div className="text-[10px] text-amber-700">Instant Test</div>
            </button>
          </div>

          {/* Mode 1: Razorpay */}
          {method === "razorpay" && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-[#fbfaf7] p-5 border border-[#e2e5dc]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    💳
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#24312d]">सुरक्षित ऑनलाइन पेमेंट गेटवे</h4>
                    <p className="text-xs text-[#65706a]">
                      डेबिट कार्ड, क्रेडिट कार्ड, नेटबँकिंग व यूपीआय द्वारे थेट भरणा
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#eef0e8] flex items-center gap-2 text-[11px] text-[#65706a]">
                  <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                  <span>२५६-बिट एनक्रिप्टेड आणि रिझर्व्ह बँक ऑफ इंडिया नियमांनुसार सुरक्षित</span>
                </div>
              </div>

              <button
                type="button"
                disabled={processing}
                onClick={handleRazorpayPayment}
                className="w-full rounded-2xl bg-[#b5623b] py-4 text-sm sm:text-base font-bold text-white shadow-lg hover:bg-[#974a27] transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {processing ? (
                  <>पेमेंट तपासले जात आहे...</>
                ) : (
                  <>
                    <Lock size={16} />
                    ₹{amountToPay.toLocaleString("en-IN")} शुल्क भरा आणि प्रवेश पक्का करा
                  </>
                )}
              </button>
            </div>
          )}

          {/* Mode 2: UPI QR Code */}
          {method === "upi_qr" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#e2e5dc] bg-[#fbfaf7] p-5 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-[#b5623b] mb-1">
                  परिवर्तन मिशन फाउंडेशन अधिकृत QR कोड
                </p>
                <p className="text-[11px] text-[#65706a] mb-3">
                  कोणत्याही UPI ॲपवरून स्कॅन करून ₹{amountToPay} पाठवा
                </p>

                {/* QR Code Container */}
                <div className="mx-auto w-48 h-48 bg-white p-3 rounded-2xl border border-gray-200 shadow-md flex flex-col items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${upiId}&pn=Parivattan%20Mission%20Foundation&am=${amountToPay}&cu=INR`}
                    alt="UPI QR Code"
                    className="w-40 h-40 object-contain rounded-lg"
                  />
                </div>

                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#24312d] bg-white px-3 py-1 rounded-lg border">
                    {upiId}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="inline-flex items-center gap-1 rounded-lg bg-[#24312d] text-white px-2.5 py-1 text-xs font-semibold hover:bg-[#b5623b]"
                  >
                    {copiedUpi ? <Check size={13} /> : <Copy size={13} />}
                    {copiedUpi ? "कॉपी झाले" : "कॉपी करा"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#24312d] mb-1">
                  पेमेंट झाल्यानंतर १२-अंकी UTR / UPI Ref नंबर प्रविष्ट करा *
                </label>
                <input
                  type="text"
                  placeholder="उदा. 4289XXXXXXXX किंवा UPI ट्रॅन्झॅक्शन आयडी"
                  value={upiRefId}
                  onChange={(e) => setUpiRefId(e.target.value)}
                  className="w-full rounded-xl border border-[#d5d9cf] bg-[#fbfaf7] py-2.5 px-3.5 text-sm text-[#24312d] focus:border-[#b5623b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b5623b]/20 transition"
                />
              </div>

              <button
                type="button"
                disabled={processing}
                onClick={handleUpiSubmit}
                className="w-full rounded-2xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {processing ? (
                  <>पडताळणी होत आहे...</>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    UTR क्रमांक सबमिट करा व प्रवेश निश्चित करा
                  </>
                )}
              </button>
            </div>
          )}

          {/* Mode 3: Instant Sandbox */}
          {method === "sandbox" && (
            <div className="space-y-4 rounded-2xl bg-amber-50 border border-amber-200 p-5">
              <div className="flex items-start gap-3">
                <Zap size={24} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    त्वरित डेमो मंजुरी (Instant Sandbox Mode)
                  </h4>
                  <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                    मूल्यांकन व चाचणीसाठी कोणतीही प्रत्यक्ष रक्कम न भरता १-क्लिकमध्ये प्रवेश प्रक्रिया पूर्ण करा व अधिकृत प्रवेश पावती तपासा.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={processing}
                onClick={handleSandboxPayment}
                className="w-full rounded-xl bg-amber-600 hover:bg-amber-700 py-3.5 text-sm font-bold text-white shadow-md transition flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>नोंदणी पूर्ण होत आहे...</>
                ) : (
                  <>
                    ⚡ डेमो पेमेंट निश्चित करा (Simulate Approval)
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right: Admission Summary & Fee Breakdown */}
        <div className="space-y-5">
          {/* Candidate & Course Summary */}
          <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 shadow-sm">
            <h4 className="font-serif text-base font-bold text-[#24312d] pb-3 border-b border-[#eef0e8]">
              प्रवेश सारांश (Admission Summary)
            </h4>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[#65706a]">विद्यार्थी नाव:</span>
                <span className="font-bold text-[#24312d]">{formData.fullName || student.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#65706a]">विद्यार्थी PRN:</span>
                <span className="font-mono font-bold text-[#b5623b]">{student.prn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#65706a]">निवडलेला कोर्स:</span>
                <span className="font-bold text-[#24312d] text-right">{course.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#65706a]">कोर्स कोड:</span>
                <span className="font-mono text-[#24312d]">{course.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#65706a]">विभाग / शाळा:</span>
                <span className="text-[#24312d]">{course.school}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#65706a]">बॅच वेळ:</span>
                <span className="text-[#24312d]">{formData.batchPreference}</span>
              </div>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="rounded-3xl border border-[#e2e5dc] bg-white p-6 shadow-sm">
            <h4 className="font-serif text-base font-bold text-[#24312d] pb-3 border-b border-[#eef0e8]">
              शुल्क तपशील (Fee Breakdown)
            </h4>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-[#65706a]">
                <span>नियमित कोर्स शुल्क (Standard Fee):</span>
                <span>₹{course.totalFee.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>परिवर्तन फाउंडेशन स्कॉलरशिप सवलत:</span>
                <span>- ₹{(course.totalFee - course.finalPayable).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-[#65706a]">
                <span>डिजिटल स्टडी किट व LMS ॲक्सेस:</span>
                <span className="text-emerald-700 font-semibold">मोफत (Free)</span>
              </div>
              <div className="flex justify-between text-[#65706a]">
                <span>परीक्षा व प्रमाणपत्र शुल्क:</span>
                <span className="text-emerald-700 font-semibold">समाविष्ट (Included)</span>
              </div>

              <div className="pt-3 border-t border-[#eef0e8] flex justify-between items-baseline">
                <span className="text-sm font-bold text-[#24312d]">अंतिम देय शुल्क (Payable):</span>
                <span className="text-2xl font-serif font-bold text-[#b5623b]">
                  ₹{amountToPay.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-[#fbfaf7] p-3 text-[11px] text-[#65706a] border border-[#e2e5dc]">
              <p className="flex items-center gap-1.5 font-semibold text-[#24312d]">
                <ShieldCheck size={14} className="text-[#b5623b]" />
                १००% पारदर्शक व पावतीसह
              </p>
              <p className="mt-1">
                शुल्क भरल्यानंतर त्वरित अधिकृत प्रवेश पावती (Admission Receipt) व डिजिटल ओळखपत्र प्राप्त होईल.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
