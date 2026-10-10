import React, { useState, useEffect } from "react";
import { Heart, ArrowLeft, Shield, Gift, Calendar, CheckCircle, Users, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { getDonationStats } from "@/lib/supabase-admin";
import qrCode from "../assets/qr.png";

const FUNDRAISING_GOAL = 20000000;

const DonationPage = () => {
  const navigate = useNavigate();
  const [raised, setRaised] = useState<number>(0);  
  const [donorCount, setDonorCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonationData = async () => {
      try {
        setLoading(true);
        const stats = await getDonationStats();
        setRaised(stats.total_amount);
        setDonorCount(stats.total_donations);
      } catch (error) {
        console.error("Error fetching donation stats:", error);
        setRaised(0);
        setDonorCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchDonationData();
  }, []);

  const progress = Math.min((raised / FUNDRAISING_GOAL) * 100, 100);

  const handleDonate = () => {
    window.open("https://razorpay.me/@parivattanmissionfoundation", "_blank");
  };

  const handleSubscribe = () => {
    window.open("https://rzp.io/rzp/mDdH2rh", "_blank");
  }

  const benefits = [
    {
      icon: <Shield size={28} className="text-blue-500" />,
      title: "100% Secure",
      description: "All transactions are encrypted and secure",
    },
    {
      icon: <Gift size={28} className="text-blue-500" />,
      title: "Tax Benefits",
      description: "Donations may be eligible for tax deductions",
    },
    {
      icon: <Heart size={28} className="text-blue-500" />,
      title: "Direct Impact",
      description: "Your contribution directly helps our mission",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="section-padding pt-20 md:pt-48 bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-20 right-0 w-72 h-72 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-100 to-blue-100 rounded-full blur-3xl opacity-40"></div>

        <div className="container mx-auto relative z-10">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors font-medium"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
          </button>

          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full border border-blue-200 mb-6">
              <Heart size={16} className="text-blue-600" />
              <span className="text-blue-700 text-sm font-medium">Make an Impact Today</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-800 mb-6">
              Support Our Mission
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Your donation helps us create sustainable social impact and support communities in need
            </p>
          </div>
        </div>
      </section>

      {/* Fund Raised Section */}
      <section className="section-padding pt-8 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-3xl p-10 md:p-14 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-serif font-bold text-white mb-4">
                  Education Inclusion Campaign
                </h2>
                <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-4">
                  "Be Shahu Build Ambedkar."
                </p>
                <p className="text-blue-200 text-sm">
                  Republic Day to Rajarshi Shahu Maharaj Jayanti | 26 January 2026 to 26 June 2026
                </p>
              </div>

              {/* Progress Stats */}
              <div className="grid md:grid-cols-4 gap-4 mb-10">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/10">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                    ₹{raised.toLocaleString("en-IN")}
                  </div>
                  <div className="text-blue-200 font-medium">Funds Raised</div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/10">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                    {progress.toFixed(3)}%
                  </div>
                  <div className="text-blue-200 font-medium">Progress</div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/10">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                    ₹{(FUNDRAISING_GOAL - raised).toLocaleString("en-IN")}
                  </div>
                  <div className="text-blue-200 font-medium">Remaining</div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/10">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                    ₹25,00,000
                  </div>
                  <div className="text-blue-200 font-medium">Target Goal</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm font-medium text-blue-200 mb-2">
                  <span>Progress: {progress.toFixed(3)}%</span>
                  <span>Remaining: ₹{(FUNDRAISING_GOAL - raised).toLocaleString("en-IN")}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-5 rounded-full transition-all duration-700 relative"
                    style={{ width: `${Math.max(progress, 0.1)}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                <div className="flex justify-between text-sm font-medium text-blue-200 mt-4">
                  <span>₹{raised.toLocaleString("en-IN")} raised</span>
                  <span>Goal: ₹25,00,000</span>
                </div>
              </div>

              {/* Donation Count */}
              <div className="text-center bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/10">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users size={24} className="text-blue-400" />
                  <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    {donorCount}
                  </div>
                </div>
                <div className="text-blue-200 text-lg font-medium">
                  Community Members Supporting Us
                </div>
              </div>

              {/* Impact Message */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-blue-400/30">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle size={20} className="text-blue-400" />
                  Why Your Donation Matters
                </h3>
                <p className="text-blue-100 leading-relaxed mb-4">
                  Every rupee raised through our collective effort helps us create sustainable social impact. Your contribution enables us to provide education, healthcare, and livelihood support to communities in need.
                </p>
                <p className="text-blue-100 leading-relaxed">
                  Together, we can achieve our ₹25 Lakh goal and create meaningful, measurable change that transforms lives.
                </p>
              </div>

              {/* QR Code Section */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/10">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="bg-white p-3 rounded-xl">
                    <img 
                      src={qrCode}
                      alt="Donation QR Code" 
                      className="w-40 h-40 object-contain"
                    />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-xl font-semibold text-white mb-2 flex items-center justify-center md:justify-start gap-2">
                      <QrCode size={20} className="text-blue-400" />
                      Scan to Donate Instantly
                    </h3>
                    <p className="text-blue-200 text-sm mb-3">
                      Use any UPI app to scan this QR code and make a quick donation.
                    </p>
                    <p className="text-cyan-400 text-xs font-medium">
                      Supports Google Pay, PhonePe, Paytm & all UPI apps
                    </p>
                  </div>
                </div>
              </div>

              {/* Donate Button */}
              <button
                onClick={handleDonate}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-5 rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-[1.02] flex items-center justify-center text-lg shadow-xl hover:shadow-2xl"
              >
                <Heart size={24} className="mr-3" />
                Donate Now
              </button>

              <p className="text-sm text-blue-300 text-center mt-4 flex items-center justify-center gap-2">
                <Shield size={14} />
                Secured and processed by Razorpay
              </p>
            </div>
          </div>
        </div>

</section>

          

          {/* Parivattan Sathi - 135th Jayanti Special */}
          <section className="section-padding bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-blue-600/5 to-cyan-600/5 rounded-full blur-3xl"></div>

            <div className="container mx-auto relative z-10">
              {/* Header Section */}
              <div className="text-center max-w-4xl mx-auto mb-12">
                <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-400/30 mb-6">
                  <span className="text-4xl">✨</span>
                  <span className="text-blue-300 font-semibold">135th Birth Anniversary</span>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-white">
                  ₹135 for the 135th Jayanti
                </h2>
                
                <p className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-6">
                  Be a Parivattan Sathi
                </p>
                
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-blue-400/20 mb-8">
                  <p className="text-blue-200 text-lg mb-2">
                    On the occasion of <span className="text-white font-semibold">Dr. Babasaheb Ambedkar Jayanti</span>
                  </p>
                  <p className="text-cyan-400 text-xl font-bold">
                    14 April 2026 | 135th Birth Anniversary
                  </p>
                </div>
              </div>

              {/* Main Card */}
              <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-10 border border-blue-400/30 hover:border-blue-400/50 transition-all relative overflow-hidden">
                  {/* Sparkle decoration */}
                  <div className="absolute top-4 right-4 text-4xl">✨</div>
                  <div className="absolute bottom-4 left-4 text-2xl opacity-50">✨</div>
                  
                  <div className="text-center mb-8">
                    <p className="text-blue-200 text-lg italic mb-6">
                      "Celebrate Babasaheb not just with words, but with action."
                    </p>
                    
                    <div className="mb-6">
                      <span className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400">
                        ₹135
                      </span>
                      <span className="text-2xl text-blue-300 font-medium">/month</span>
                    </div>
                    
                    <p className="text-white text-lg font-medium mb-2">
                      Give just ₹135/month to strengthen
                    </p>
                    <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 text-xl font-bold mb-6">
                      Babasaheb's Education Movement
                    </p>
                    <p className="text-blue-200">
                      and help build an equal, educated future.
                    </p>
                  </div>

                  {/* Benefits */}
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-center gap-3 text-blue-100">
                      <CheckCircle size={20} className="text-cyan-400 flex-shrink-0" />
                      <span>Support Babasaheb's Education Movement</span>
                    </li>
                    <li className="flex items-center gap-3 text-blue-100">
                      <CheckCircle size={20} className="text-cyan-400 flex-shrink-0" />
                      <span>Monthly recurring contribution of ₹135</span>
                    </li>
                    <li className="flex items-center gap-3 text-blue-100">
                      <CheckCircle size={20} className="text-cyan-400 flex-shrink-0" />
                      <span>Be part of creating an equal, educated future</span>
                    </li>
                  </ul>

                  {/* Subscribe Button */}
                  <button
                    onClick={handleSubscribe}
                    className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-600 text-white font-bold py-5 rounded-2xl hover:from-blue-600 hover:via-blue-700 hover:to-cyan-700 transition-all transform hover:scale-[1.02] flex items-center justify-center text-xl shadow-xl hover:shadow-2xl"
                  >
                    <Heart size={24} className="mr-3" />
                    Subscribe to Parivattan Sathi 
                  </button>
                  
                  <p className="text-sm text-blue-300 text-center mt-4 flex items-center justify-center gap-2">
                    <Shield size={14} />
                    Secured and processed by Razorpay
                  </p>
                </div>
              </div>

              {/* Footer Message */}
              <div className="text-center mt-12 max-w-2xl mx-auto">
                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/20 rounded-2xl p-6">
                  <p className="text-blue-200 text-lg italic mb-2">
                    "Because education is the truest tribute to Babasaheb."
                  </p>
                  <p className="text-blue-300 text-sm">
                    On the occasion of Dr. Babasaheb Ambedkar Jayanti — 14 April 2026
                  </p>
                </div>
                
                <p className="text-blue-400 mt-6 text-sm">
                  👉 Join {donorCount}+ supporters in creating positive social change
                </p>
              </div>
            </div>
          </section>

      <Footer />
    </div>
  );
};

export default DonationPage;
