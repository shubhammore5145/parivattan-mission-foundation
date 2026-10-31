import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  CreditCard,
  Heart,
  TrendingUp,
  Users,
  Calendar,
  Phone,
  Mail,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Repeat,
} from "lucide-react";
import {
  getSubscriptionsData,
  SubscriptionItem,
  RecurringPaymentItem,
  SubscriptionPlanItem,
  SubscriptionResponse,
} from "@/lib/subscriptionService";
import { toast } from "sonner";

export default function SubscriptionsManager() {
  const [data, setData] = useState<SubscriptionResponse>({
    success: true,
    subscriptions: [],
    recurringPayments: [],
    plans: [],
    stats: {
      totalSubscribers: 0,
      activeSubscribers: 0,
      totalRevenue: 0,
      totalTransactions: 0,
      plansCount: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"subscribers" | "payments" | "plans">("subscribers");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load subscriptions data
  const loadData = async (force = false) => {
    try {
      if (force) setRefreshing(true);
      else setLoading(true);

      const res = await getSubscriptionsData(force);
      setData(res);
      if (force) {
        toast.success("Subscriptions synchronized with Razorpay successfully!");
      }
    } catch (err: any) {
      console.error("Error loading subscriptions:", err);
      toast.error("Could not sync subscriptions: " + (err?.message || "Unknown error"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopy = (text: string, label = "ID") => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success(`Copied ${label}: ${text}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered subscribers
  const filteredSubscriptions = useMemo(() => {
    return (data.subscriptions || []).filter((sub) => {
      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "active" && sub.status !== "active" && sub.paidCount === 0) return false;
        if (statusFilter === "cancelled" && sub.status !== "cancelled") return false;
        if (statusFilter === "created" && sub.status !== "created") return false;
      }

      // Plan filter
      if (planFilter !== "all" && sub.planName !== planFilter) {
        return false;
      }

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        sub.id.toLowerCase().includes(q) ||
        (sub.subscriberName || "").toLowerCase().includes(q) ||
        (sub.subscriberEmail || "").toLowerCase().includes(q) ||
        (sub.subscriberPhone || "").toLowerCase().includes(q) ||
        (sub.planName || "").toLowerCase().includes(q)
      );
    });
  }, [data.subscriptions, searchQuery, statusFilter, planFilter]);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return (data.recurringPayments || []).filter((pay) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        pay.id.toLowerCase().includes(q) ||
        (pay.email || "").toLowerCase().includes(q) ||
        (pay.contact || "").toLowerCase().includes(q) ||
        (pay.description || "").toLowerCase().includes(q)
      );
    });
  }, [data.recurringPayments, searchQuery]);

  // Export CSV of subscribers
  const exportCSV = () => {
    if (!data.subscriptions.length) {
      toast.info("No subscribers available to export.");
      return;
    }

    const headers = [
      "Subscription ID",
      "Subscriber Name",
      "Email",
      "Phone",
      "Plan Name",
      "Plan Amount (INR)",
      "Status",
      "Paid Cycles",
      "Total Paid (INR)",
      "Created Date",
    ];

    const rows = filteredSubscriptions.map((s) => [
      `"${s.id}"`,
      `"${s.subscriberName || "Supporter"}"`,
      `"${s.subscriberEmail || ""}"`,
      `"${s.subscriberPhone || ""}"`,
      `"${s.planName || "Parivattan Sathi"}"`,
      s.planAmount,
      `"${s.status}"`,
      s.paidCount,
      s.totalPaidAmount,
      `"${new Date(s.createdAt).toLocaleDateString("en-IN")}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `parivattan_subscribers_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Subscribers list exported as CSV!");
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1b2b25] via-[#24372e] to-[#1b2b25] text-white p-7 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#1abc9c]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-[#b5623b]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1abc9c]/20 border border-[#1abc9c]/30 text-[#1abc9c] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={13} />
              <span>Recurring Memberships & Parivattan Sathi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              Subscribers & Monthly Donors
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-stone-300 max-w-2xl">
              Track everyone who has subscribed to Parivattan Sathi (₹135/mo) and monthly donor plans, automated Razorpay charges, and recurring contributions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              <span>{refreshing ? "Syncing Razorpay..." : "Sync Razorpay"}</span>
            </button>

            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1abc9c] hover:bg-[#16a085] text-white text-xs font-bold transition shadow-md cursor-pointer"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 2. Top Stats Cards Grid */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between text-stone-300 text-xs mb-1">
              <span>Total Subscribers</span>
              <Users size={16} className="text-[#1abc9c]" />
            </div>
            <p className="text-2xl font-serif font-bold text-white">
              {data.stats.totalSubscribers}
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {data.stats.activeSubscribers} active recurring donors
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between text-stone-300 text-xs mb-1">
              <span>Total Recurring Collected</span>
              <TrendingUp size={16} className="text-[#fedb41]" />
            </div>
            <p className="text-2xl font-serif font-bold text-[#fedb41]">
              ₹{data.stats.totalRevenue.toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Across {data.stats.totalTransactions} auto-debit cycles
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between text-stone-300 text-xs mb-1">
              <span>Automated Cycles</span>
              <Repeat size={16} className="text-emerald-400" />
            </div>
            <p className="text-2xl font-serif font-bold text-white">
              {data.stats.totalTransactions}
            </p>
            <p className="text-[11px] text-emerald-300 mt-0.5">
              Captured via UPI AutoPay & Cards
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between text-stone-300 text-xs mb-1">
              <span>Configured Plans</span>
              <CreditCard size={16} className="text-[#b5623b]" />
            </div>
            <p className="text-2xl font-serif font-bold text-white">
              {data.plans.length || 8}
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              ₹135, ₹500, ₹1k, ₹2k, ₹5k / mo
            </p>
          </div>
        </div>
      </div>

      {/* 3. Sub-Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[#e2e5dc] pb-3">
        <button
          onClick={() => setActiveSubTab("subscribers")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === "subscribers"
              ? "bg-[#24312d] text-white shadow-sm"
              : "text-[#65706a] hover:text-[#24312d] hover:bg-stone-100"
          }`}
        >
          <Users size={15} />
          <span>Subscribers List ({filteredSubscriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("payments")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === "payments"
              ? "bg-[#24312d] text-white shadow-sm"
              : "text-[#65706a] hover:text-[#24312d] hover:bg-stone-100"
          }`}
        >
          <Repeat size={15} />
          <span>Auto-Debit Receipts ({data.recurringPayments.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("plans")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === "plans"
              ? "bg-[#24312d] text-white shadow-sm"
              : "text-[#65706a] hover:text-[#24312d] hover:bg-stone-100"
          }`}
        >
          <CreditCard size={15} />
          <span>Available Plans & Links ({data.plans.length})</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      {activeSubTab !== "plans" && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder={
                activeSubTab === "subscribers"
                  ? "Search by subscriber name, email, phone, or ID..."
                  : "Search payment ID, email, or contact..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#e2e5dc] bg-white text-xs text-[#24312d] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1abc9c]/30 focus:border-[#1abc9c]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {activeSubTab === "subscribers" && (
            <div className="flex items-center gap-2.5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#e2e5dc] bg-white text-xs font-semibold text-[#24312d] focus:outline-none focus:ring-2 focus:ring-[#1abc9c]/30"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Supporters</option>
                <option value="created">Created / Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-[#e2e5dc] bg-white text-xs font-semibold text-[#24312d] focus:outline-none focus:ring-2 focus:ring-[#1abc9c]/30"
              >
                <option value="all">All Plans</option>
                <option value="Parivattan Sathi">Parivattan Sathi (₹135/mo)</option>
                <option value="Parivattan Monthly Donation">Monthly Donation</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 1: SUBSCRIBERS LIST (Active Recurring Donors)
         ========================================================================= */}
      {activeSubTab === "subscribers" && (
        <div className="rounded-3xl border border-[#e2e5dc] bg-white overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fbfaf7] border-b border-[#e2e5dc] text-[11px] font-bold text-[#65706a] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Subscriber</th>
                  <th className="py-3.5 px-4">Plan & Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Cycles Paid</th>
                  <th className="py-3.5 px-4">Total Contributed</th>
                  <th className="py-3.5 px-4">Started Date</th>
                  <th className="py-3.5 px-4 text-right">Subscription ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef0e8] text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-400">
                      <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#1abc9c]" />
                      <span>Loading subscriptions from Razorpay...</span>
                    </td>
                  </tr>
                ) : filteredSubscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-stone-500">
                      <p className="font-semibold">No subscribers match the current criteria.</p>
                      <p className="text-xs text-stone-400 mt-1">
                        Try clearing search query or click "Sync Razorpay" to refresh live data.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredSubscriptions.map((sub) => {
                    const isSumit = sub.subscriberEmail.includes("sumit");
                    const displayName =
                      sub.subscriberName && sub.subscriberName !== "Subscriber"
                        ? sub.subscriberName
                        : isSumit
                        ? "Sumit (Parivattan Sathi Supporter)"
                        : sub.subscriberEmail
                        ? sub.subscriberEmail.split("@")[0]
                        : "Supporter";

                    return (
                      <tr key={sub.id} className="hover:bg-stone-50/60 transition">
                        {/* 1. Subscriber Details */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1abc9c]/20 to-[#1abc9c]/5 text-[#1abc9c] font-bold flex items-center justify-center shrink-0 border border-[#1abc9c]/30">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-[#24312d] leading-snug">
                                {displayName}
                              </p>
                              {sub.subscriberEmail && (
                                <a
                                  href={`mailto:${sub.subscriberEmail}`}
                                  className="text-[11px] text-[#65706a] hover:text-[#1abc9c] flex items-center gap-1 mt-0.5"
                                >
                                  <Mail size={11} />
                                  <span>{sub.subscriberEmail}</span>
                                </a>
                              )}
                              {sub.subscriberPhone && (
                                <a
                                  href={`tel:${sub.subscriberPhone}`}
                                  className="text-[10px] text-stone-400 hover:text-stone-700 flex items-center gap-1"
                                >
                                  <Phone size={10} />
                                  <span>{sub.subscriberPhone}</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2. Plan & Amount */}
                        <td className="py-3.5 px-4">
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <Heart size={11} className="text-[#b5623b]" />
                              {sub.planName}
                            </span>
                            <p className="font-bold text-[#24312d] mt-1 text-xs">
                              ₹{sub.planAmount.toLocaleString("en-IN")}{" "}
                              <span className="text-[10px] text-stone-400 font-normal">
                                / {sub.period}
                              </span>
                            </p>
                          </div>
                        </td>

                        {/* 3. Status */}
                        <td className="py-3.5 px-4">
                          {sub.status === "active" || sub.paidCount > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 size={12} />
                              <span>Active Supporter</span>
                            </span>
                          ) : sub.status === "created" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <Clock size={12} />
                              <span>Mandate Created</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-600 border border-stone-200">
                              <span>{sub.status}</span>
                            </span>
                          )}
                        </td>

                        {/* 4. Cycles Paid */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#24312d] font-mono">
                              {sub.paidCount}
                            </span>
                            <span className="text-[11px] text-stone-400">
                              of {sub.totalCount} cycles
                            </span>
                          </div>
                          {sub.paidCount > 0 && (
                            <div className="w-24 bg-stone-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                              <div
                                className="bg-[#1abc9c] h-full rounded-full"
                                style={{
                                  width: `${Math.min(
                                    (sub.paidCount / (sub.totalCount || 12)) * 100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          )}
                        </td>

                        {/* 5. Total Paid Amount */}
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-emerald-700 text-sm font-serif">
                            ₹{sub.totalPaidAmount.toLocaleString("en-IN")}
                          </span>
                        </td>

                        {/* 6. Started Date */}
                        <td className="py-3.5 px-4 text-stone-500 text-[11px]">
                          {new Date(sub.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        {/* 7. Subscription ID */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleCopy(sub.id, "Subscription ID")}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-[10px] font-mono text-stone-700 transition cursor-pointer"
                            title="Click to copy Subscription ID"
                          >
                            <span>{sub.id}</span>
                            {copiedId === sub.id ? (
                              <Check size={11} className="text-emerald-600" />
                            ) : (
                              <Copy size={11} className="text-stone-400" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: AUTO-DEBIT PAYMENT RECEIPTS (Recurring Transaction Receipts)
         ========================================================================= */}
      {activeSubTab === "payments" && (
        <div className="rounded-3xl border border-[#e2e5dc] bg-white overflow-hidden shadow-xs">
          <div className="p-4 bg-[#fbfaf7] border-b border-[#e2e5dc] flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#24312d]">
                Auto-Debit Receipts & Bank Transactions
              </h4>
              <p className="text-[11px] text-[#65706a]">
                Every monthly charge captured via UPI AutoPay or Credit/Debit mandate.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              {filteredPayments.length} Transactions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-[#e2e5dc] text-[11px] font-bold text-[#65706a] uppercase tracking-wider">
                  <th className="py-3 px-4">Payment ID</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Subscriber</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eef0e8] text-xs">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-stone-400">
                      No recurring payment receipts found.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/60 transition">
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleCopy(p.id, "Payment ID")}
                          className="inline-flex items-center gap-1 font-mono text-[11px] text-[#24312d] hover:text-[#1abc9c] font-bold cursor-pointer"
                        >
                          <span>{p.id}</span>
                          {copiedId === p.id ? (
                            <Check size={11} className="text-emerald-600" />
                          ) : (
                            <Copy size={11} className="text-stone-400" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-stone-500 text-[11px]">
                        {new Date(p.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        <span className="text-stone-400">
                          {new Date(p.createdAt).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-[#24312d]">{p.email || "Subscriber"}</p>
                        {p.contact && (
                          <p className="text-[10px] text-stone-400">{p.contact}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#24312d] text-sm">
                          ₹{p.amount.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block uppercase font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                          {p.method}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#65706a] text-[11px] max-w-xs truncate">
                        {p.description}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {p.status === "captured" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={12} />
                            <span>Captured</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle size={12} />
                            <span>{p.status}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: AVAILABLE PLANS & DIRECT PAYMENT LINKS
         ========================================================================= */}
      {activeSubTab === "plans" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
            <Zap size={20} className="text-[#b5623b] shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <p className="font-bold">Shareable Subscription Links for Supporters</p>
              <p className="mt-0.5 text-amber-800/90">
                You can copy any plan link below and send it via WhatsApp, SMS, or Email. When donors complete payment on these links, their subscriptions appear automatically here!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Parivattan Sathi Special ₹135 Plan */}
            <div className="rounded-3xl border-2 border-[#1abc9c] bg-white p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-3 right-3">
                <span className="px-2.5 py-0.5 rounded-full bg-[#1abc9c]/10 text-[#1abc9c] text-[10px] font-extrabold uppercase tracking-wider">
                  Most Popular
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">✨</span>
                  <h4 className="font-bold text-base text-[#24312d]">
                    Parivattan Sathi
                  </h4>
                </div>
                <p className="text-xs text-[#65706a] mb-4">
                  135th Dr. Babasaheb Ambedkar Jayanti Movement Fund. Monthly recurring donation to empower rural education.
                </p>

                <div className="mb-4">
                  <span className="text-3xl font-serif font-bold text-[#24312d]">
                    ₹135
                  </span>
                  <span className="text-xs text-stone-500 font-medium"> / month</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#eef0e8] flex items-center gap-2">
                <button
                  onClick={() =>
                    handleCopy("https://rzp.io/rzp/mDdH2rh", "Parivattan Sathi Link")
                  }
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#1abc9c] hover:bg-[#16a085] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Copy size={13} />
                  <span>Copy Link</span>
                </button>
                <a
                  href="https://rzp.io/rzp/mDdH2rh"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 transition"
                  title="Open Link in New Tab"
                >
                  <ExternalLink size={15} />
                </a>
              </div>
            </div>

            {/* Standard Monthly Plans */}
            {[
              {
                name: "Monthly Supporter - Level 1",
                amount: 500,
                desc: "Direct support for Japanese & German language coaching materials and classroom access.",
                url: "https://rzp.io/rzp/mges4uW",
              },
              {
                name: "Monthly Supporter - Level 2",
                amount: 1000,
                desc: "Sponsor certification scholarship and exam fees for high-performing rural students.",
                url: "https://rzp.io/rzp/CLAeAJf",
              },
              {
                name: "Monthly Supporter - Tech School",
                amount: 2000,
                desc: "Equip rural students with laptops, programming bootcamps and coding skills.",
                url: "https://rzp.io/rzp/AMbOfd9g",
              },
              {
                name: "Monthly Patron / Fellowship",
                amount: 5000,
                desc: "Full comprehensive student scholarship covering education, certification, and mentorship.",
                url: "https://rzp.io/rzp/Q3RNQ0b",
              },
            ].map((p) => (
              <div
                key={p.amount}
                className="rounded-3xl border border-[#e2e5dc] bg-white p-6 shadow-xs flex flex-col justify-between hover:border-stone-400 transition"
              >
                <div>
                  <h4 className="font-bold text-sm text-[#24312d] mb-1">
                    {p.name}
                  </h4>
                  <p className="text-xs text-[#65706a] mb-4 leading-relaxed">
                    {p.desc}
                  </p>

                  <div className="mb-4">
                    <span className="text-2xl font-serif font-bold text-[#24312d]">
                      ₹{p.amount.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs text-stone-500 font-medium"> / month</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#eef0e8] flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(p.url, `${p.name} Link`)}
                    className="flex-1 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#24312d] text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Copy size={13} />
                    <span>Copy Link</span>
                  </button>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 transition"
                    title="Open Link"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

