import { FormEvent, useState } from "react";
import { 
  ArrowRight, 
  CheckCircle2, 
  LoaderCircle, 
  ShieldCheck, 
  UserCircle, 
  BookOpen, 
  Clock, 
  Info, 
  Phone, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Users, 
  GraduationCap, 
  Award,
  HelpCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createAdmission } from "@/lib/supabase-admin";
import { getRazorpayKeyId, loadRazorpay } from "@/lib/razorpay";
import { toast } from "sonner";

const programs = [
  "Parivattan Overseas Schools - IELTS / TOEFL / PTE",
  "Parivattan Foreign Language School",
  "Parivattan Technology School"
];

const programCourses: Record<string, string[]> = {
  "Parivattan Overseas Schools - IELTS / TOEFL / PTE": [
    "IELTS Preparation (Academic / General)",
    "TOEFL iBT Comprehensive Coaching",
    "PTE Academic Preparation",
    "Study Abroad Counseling & Visa Guidance",
    "GRE / GMAT Foundation Coaching"
  ],
  "Parivattan Foreign Language School": [
    "German Language (A1, A2, B1 Levels)",
    "French Language (A1, A2 Levels)",
    "Japanese Language (JLPT N5, N4)",
    "Spanish Language Fundamentals",
    "Spoken English & Professional Communication"
  ],
  "Parivattan Technology School": [
    "Full-Stack Web Development (React / Node.js)",
    "Python Programming & Data Analytics",
    "AI, Generative Tools & Automation Basics",
    "UI/UX Design & Frontend Development",
    "Digital Marketing & SEO Strategies"
  ]
};

const genders = ["Male", "Female", "Other"];
const qualifications = ["10th Pass", "12th Pass", "Undergraduate (Pursuing)", "Graduate", "Post-Graduate", "Diploma", "Other"];
const statuses = ["Student", "Working Professional", "Job Seeker", "Entrepreneur / Business Owner", "Other"];
const timings = [
  "Morning Batch (8:00 AM - 11:00 AM)", 
  "Afternoon Batch (12:00 PM - 3:00 PM)", 
  "Evening Batch (4:00 PM - 7:00 PM)", 
  "Weekend Batch (Saturday & Sunday)"
];
const scholarshipOptions = [
  "No - Standard Registration", 
  "Yes - Request Scholarship / Fee Concession"
];
const sources = [
  "Social Media (Instagram / LinkedIn / Facebook)", 
  "Friend / Family Recommendation", 
  "Official Website / Search", 
  "Advertisement / Poster", 
  "College / Campus Drive", 
  "Other"
];

const faqs = [
  {
    q: "What happens after paying the ₹500 registration fee?",
    a: "Once your payment is verified, our academic counseling team will contact you within 24 hours to confirm your batch timing, orientation schedule, and required enrollment documents."
  },
  {
    q: "Are classes conducted online or in person?",
    a: "We offer both flexible modes! You can choose interactive live online sessions or attend classroom batches in person at our foundation center based on your convenience."
  },
  {
    q: "How does scholarship or fee assistance work?",
    a: "Parivattan Mission Foundation provides merit and need-based fee concessions for deserving students. Simply select 'Yes' under the scholarship option, and our committee will assess eligibility during counseling."
  },
  {
    q: "Who should I contact if I have any questions or payment issues?",
    a: "For immediate assistance, call us at +91 7820831901 or click the WhatsApp Chat button on this page to speak directly with our admissions support desk."
  }
];

export default function AdmissionsPage() {
  const [busy, setBusy] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    dob: "", 
    gender: genders[0], 
    guardianName: "",
    guardianPhone: "",
    address: "",
    city: "", 
    pincode: "",
    qualification: qualifications[0], 
    currentStatus: statuses[0],
    program: programs[0], 
    specificCourse: programCourses[programs[0]][0],
    batchTiming: timings[0], 
    scholarshipNeeded: scholarshipOptions[0],
    source: sources[0],
    message: "",
    agreedToTerms: false
  });
  
  const update = (key: keyof typeof form, value: string | boolean) => {
    setForm(current => {
      const updated = { ...current, [key]: value };
      // Auto-update first course when program changes
      if (key === "program" && typeof value === "string" && programCourses[value]) {
        updated.specificCourse = programCourses[value][0];
      }
      return updated;
    });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.name || !form.email || !form.phone || !form.dob || !form.city || !form.address || !form.guardianName || !form.guardianPhone) { 
      toast.error("Please fill in all required fields (Name, Email, Phone, Guardian Details, Address, City)."); 
      return; 
    }

    if (!form.agreedToTerms) {
      toast.error("Please agree to the terms and declaration before proceeding.");
      return;
    }

    setBusy(true);
    try {
      await loadRazorpay();
      const key = getRazorpayKeyId();
      if (!key || !window.Razorpay) throw new Error("Payment gateway is not configured.");
      
      const fullMessage = [
        `DOB: ${form.dob} | Gender: ${form.gender}`,
        `Guardian: ${form.guardianName} | Guardian Contact: ${form.guardianPhone}`,
        `Address: ${form.address}, City: ${form.city} - ${form.pincode}`,
        `Qualification: ${form.qualification} | Status: ${form.currentStatus}`,
        `Selected Course: ${form.specificCourse}`,
        `Batch: ${form.batchTiming}`,
        `Scholarship Aid: ${form.scholarshipNeeded}`,
        `Source: ${form.source}`,
        form.message ? `Additional Note: ${form.message}` : ""
      ].filter(Boolean).join("\n");

      new window.Razorpay({ 
        key, 
        amount: 50000, 
        currency: "INR", 
        name: "Parivattan Mission Foundation", 
        description: "Admission Registration Fee", 
        prefill: { 
          name: form.name, 
          email: form.email, 
          contact: form.phone 
        }, 
        theme: { color: "#b5623b" }, 
        handler: async (response: { razorpay_payment_id: string }) => {
          try {
            await createAdmission({ 
              name: form.name, 
              email: form.email, 
              phone: form.phone, 
              program: `${form.program} - ${form.specificCourse}`,
              message: fullMessage,
              amount: 500, 
              payment_id: response.razorpay_payment_id, 
              status: "completed" 
            });
            toast.success("Application submitted successfully! We will contact you soon.");
            setForm({ 
              name: "", 
              email: "", 
              phone: "", 
              dob: "", 
              gender: genders[0], 
              guardianName: "",
              guardianPhone: "",
              address: "",
              city: "", 
              pincode: "",
              qualification: qualifications[0], 
              currentStatus: statuses[0],
              program: programs[0], 
              specificCourse: programCourses[programs[0]][0],
              batchTiming: timings[0], 
              scholarshipNeeded: scholarshipOptions[0],
              source: sources[0], 
              message: "",
              agreedToTerms: false
            });
          } catch { 
            toast.error("Payment succeeded, but there was an issue saving your application. Please contact us with your payment ID."); 
          }
          setBusy(false);
        }, 
        modal: { 
          ondismiss: () => setBusy(false) 
        } 
      }).open();
    } catch (error) { 
      toast.error(error instanceof Error ? error.message : "Unable to initiate payment gateway."); 
      setBusy(false); 
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#24312d]">
      <Header />
      <main className="page-section pt-36">
        <div className="grid gap-12 xl:grid-cols-[0.8fr_1.2fr] xl:items-start">
          
          {/* Left Column: Information, FAQ, and Direct Contact */}
          <div className="xl:sticky xl:top-36 space-y-8">
            <div>
              <p className="eyebrow">Admissions 2026</p>
              <h1 className="mt-4 text-4xl sm:text-5xl font-serif leading-[1.08] md:text-6xl text-[#24312d]">
                Begin with a curious mind.
              </h1>
              <p className="mt-5 text-base sm:text-lg text-[#65706a]">
                Take the next step toward your future. A one-time registration fee of ₹500 is collected securely through Razorpay. Your application is saved once payment succeeds.
              </p>
              
              <div className="mt-6 space-y-3.5 text-[#55615b]">
                <p className="flex items-center gap-3">
                  <CheckCircle2 className="shrink-0 text-[#b5623b]" size={20} />
                  <span>Personalized guidance and career counseling</span>
                </p>
                <p className="flex items-center gap-3">
                  <CheckCircle2 className="shrink-0 text-[#b5623b]" size={20} />
                  <span>Practical, industry-aligned curriculum</span>
                </p>
                <p className="flex items-center gap-3">
                  <ShieldCheck className="shrink-0 text-[#b5623b]" size={20} />
                  <span>Secure digital payment and prompt support</span>
                </p>
              </div>
            </div>

            {/* Quick Assistance & WhatsApp Card */}
            <div className="rounded-3xl border border-[#e1e3d9] bg-[#fffefb] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#b5623b]/10 text-[#b5623b]">
                  <HelpCircle size={22} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-medium text-[#24312d]">Have questions or need help?</h3>
                  <p className="text-xs text-[#65706a]">Our admissions desk is here to assist you</p>
                </div>
              </div>
              <p className="text-sm text-[#65706a] mb-5">
                Reach out to us directly via WhatsApp or phone call for immediate help with your application.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a 
                  href="https://wa.me/917820831901?text=Hello%20Parivattan%20Mission%20Foundation%2C%20I%20have%20an%20admission%20inquiry."
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1ebc59] shadow-sm"
                >
                  <MessageCircle size={18} />
                  WhatsApp Chat
                </a>
                <a 
                  href="tel:+917820831901"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-[#b5623b] px-4 py-3 text-sm font-semibold text-[#b5623b] transition hover:bg-[#b5623b] hover:text-white"
                >
                  <Phone size={18} />
                  +91 7820831901
                </a>
              </div>
            </div>

            {/* FAQs Accordion */}
            <div className="rounded-3xl border border-[#e1e3d9] bg-[#fffefb] p-6 shadow-sm">
              <h3 className="font-serif text-xl font-medium text-[#24312d] mb-4">
                Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div 
                      key={idx} 
                      className="border border-[#e7e9df] rounded-2xl overflow-hidden transition-all bg-[#fbfaf7]"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 text-sm font-semibold text-[#24312d] hover:text-[#b5623b]"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <ChevronUp size={18} className="shrink-0 text-[#b5623b]" /> : <ChevronDown size={18} className="shrink-0 text-[#8b958f]" />}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-[#5a6560] leading-relaxed border-t border-[#ecefe7]">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
          
          {/* Right Column: Admission Application Form */}
          <form onSubmit={submit} className="rounded-3xl bg-white p-6 sm:p-10 shadow-sm border border-[#e1e3d9]">
            
            {/* Section 1: Personal Info */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6 border-b border-[#e1e3d9] pb-4">
                <UserCircle className="text-[#b5623b]" size={24} />
                <div>
                  <h2 className="text-2xl font-serif text-[#24312d]">Personal Information</h2>
                  <p className="text-xs text-[#65706a]">Applicant personal details</p>
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Full Name" value={form.name} onChange={value => update("name", value)} placeholder="e.g. John Doe" />
                <Field label="Email Address" type="email" value={form.email} onChange={value => update("email", value)} placeholder="e.g. john@example.com" />
                <Field label="Mobile Number (WhatsApp Preferred)" type="tel" value={form.phone} onChange={value => update("phone", value)} placeholder="e.g. 9876543210" />
                <Field label="Date of Birth" type="date" value={form.dob} onChange={value => update("dob", value)} />
                <div className="md:col-span-2">
                  <SelectField label="Gender" options={genders} value={form.gender} onChange={value => update("gender", value)} />
                </div>
              </div>
            </div>

            {/* Section 2: Guardian & Emergency Contact */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6 border-b border-[#e1e3d9] pb-4">
                <Users className="text-[#b5623b]" size={24} />
                <div>
                  <h2 className="text-2xl font-serif text-[#24312d]">Guardian & Emergency Contact</h2>
                  <p className="text-xs text-[#65706a]">Parent or guardian contact information</p>
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Parent / Guardian Name" value={form.guardianName} onChange={value => update("guardianName", value)} placeholder="e.g. Robert Doe" />
                <Field label="Guardian Phone Number" type="tel" value={form.guardianPhone} onChange={value => update("guardianPhone", value)} placeholder="e.g. 9822334455" />
              </div>
            </div>

            {/* Section 3: Residential Address */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6 border-b border-[#e1e3d9] pb-4">
                <MapPin className="text-[#b5623b]" size={24} />
                <div>
                  <h2 className="text-2xl font-serif text-[#24312d]">Residential Address</h2>
                  <p className="text-xs text-[#65706a]">Current residence details</p>
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Field label="Full Address / Street Landmark" value={form.address} onChange={value => update("address", value)} placeholder="e.g. Flat 4B, Sunrise Residency, Main Road" />
                </div>
                <Field label="City / District" value={form.city} onChange={value => update("city", value)} placeholder="e.g. Pune, Mumbai, Nashik" />
                <Field label="PIN Code" type="text" value={form.pincode} onChange={value => update("pincode", value)} placeholder="e.g. 411001" />
              </div>
            </div>

            {/* Section 4: Education & Status */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6 border-b border-[#e1e3d9] pb-4">
                <GraduationCap className="text-[#b5623b]" size={24} />
                <div>
                  <h2 className="text-2xl font-serif text-[#24312d]">Educational Background</h2>
                  <p className="text-xs text-[#65706a]">Current educational status and qualification</p>
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <SelectField label="Highest Qualification" options={qualifications} value={form.qualification} onChange={value => update("qualification", value)} />
                <SelectField label="Current Status" options={statuses} value={form.currentStatus} onChange={value => update("currentStatus", value)} />
              </div>
            </div>

            {/* Section 5: Program & Course Preferences */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6 border-b border-[#e1e3d9] pb-4">
                <BookOpen className="text-[#b5623b]" size={24} />
                <div>
                  <h2 className="text-2xl font-serif text-[#24312d]">Program & Course Preferences</h2>
                  <p className="text-xs text-[#65706a]">Choose your desired school and focus area</p>
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <SelectField label="Select School / Program" options={programs} value={form.program} onChange={value => update("program", value)} />
                </div>
                <div className="md:col-span-2">
                  <SelectField 
                    label="Specific Course / Specialization" 
                    options={programCourses[form.program] || []} 
                    value={form.specificCourse} 
                    onChange={value => update("specificCourse", value)} 
                  />
                </div>
                <SelectField label="Preferred Batch Timing" options={timings} value={form.batchTiming} onChange={value => update("batchTiming", value)} />
                <SelectField label="How did you hear about us?" options={sources} value={form.source} onChange={value => update("source", value)} />
              </div>
            </div>

            {/* Section 6: Scholarship & Aid */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6 border-b border-[#e1e3d9] pb-4">
                <Award className="text-[#b5623b]" size={24} />
                <div>
                  <h2 className="text-2xl font-serif text-[#24312d]">Scholarship & Financial Aid</h2>
                  <p className="text-xs text-[#65706a]">Tuition assistance and scholarship options</p>
                </div>
              </div>
              <div>
                <SelectField 
                  label="Need Scholarship / Fee Assistance?" 
                  options={scholarshipOptions} 
                  value={form.scholarshipNeeded} 
                  onChange={value => update("scholarshipNeeded", value)} 
                />
                <p className="mt-2 text-xs text-[#65706a]">
                  * If selected, our admissions committee will assess eligibility based on merit and financial background during counseling.
                </p>
              </div>
            </div>

            {/* Section 7: Additional Information */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6 border-b border-[#e1e3d9] pb-4">
                <Info className="text-[#b5623b]" size={24} />
                <div>
                  <h2 className="text-2xl font-serif text-[#24312d]">Additional Information</h2>
                  <p className="text-xs text-[#65706a]">Share your goals, queries, or specific needs (optional)</p>
                </div>
              </div>
              <label className="field">
                <span>What would you like us to know? (Optional)</span>
                <textarea 
                  rows={3} 
                  value={form.message} 
                  onChange={e => update("message", e.target.value)} 
                  placeholder="e.g. My goal is to work abroad, score IELTS 7.5+, or learn full-stack web development..." 
                />
              </label>
            </div>

            {/* Section 8: Terms & Declaration */}
            <div className="mb-8 rounded-2xl bg-[#fbfaf7] border border-[#e1e3d9] p-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.agreedToTerms} 
                  onChange={e => update("agreedToTerms", e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#b5623b] focus:ring-[#b5623b]"
                />
                <span className="text-xs sm:text-sm text-[#46534e] leading-relaxed">
                  I hereby declare that all information provided is accurate and true. I agree to the terms, code of conduct, and admission guidelines of Parivattan Mission Foundation.
                </span>
              </label>
            </div>

            {/* Submit Action */}
            <div className="pt-4 border-t border-[#e1e3d9]">
              <button 
                type="submit"
                disabled={busy} 
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#b5623b] px-6 py-4 font-semibold text-white transition hover:bg-[#954b2c] disabled:opacity-60 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {busy ? <LoaderCircle className="animate-spin" size={18} /> : <ArrowRight size={18} />} 
                {busy ? "Opening secure payment gateway..." : "Continue to payment · ₹500"}
              </button>
              <p className="mt-4 text-center text-xs text-[#65706a]">
                A ₹500 registration fee is required to complete enrolment. Applications are finalized upon successful payment.
              </p>
              <Link to="/" className="mt-5 block text-center text-sm font-semibold text-[#b5623b] hover:text-[#954b2c]">
                ← Return to Home
              </Link>
            </div>

          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Field({ 
  label, 
  type = "text", 
  value, 
  onChange,
  placeholder 
}: { 
  label: string; 
  type?: string; 
  value: string; 
  onChange: (value: string) => void;
  placeholder?: string;
}) { 
  return (
    <label className="field">
      <span>{label} *</span>
      <input 
        required 
        type={type} 
        value={value} 
        onChange={event => onChange(event.target.value)} 
        placeholder={placeholder}
      />
    </label>
  ); 
}

function SelectField({ 
  label, 
  options, 
  value, 
  onChange 
}: { 
  label: string; 
  options: string[]; 
  value: string; 
  onChange: (value: string) => void;
}) {
  return (
    <label className="field">
      <span>{label} *</span>
      <select value={value} onChange={e => onChange(e.target.value)}>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </label>
  );
}
