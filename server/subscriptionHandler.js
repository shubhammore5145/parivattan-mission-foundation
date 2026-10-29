import fs from "fs";
import path from "path";

let cachedData = null;
let cachedTime = 0;
const CACHE_TTL_MS = 25000; // 25s cache

function getRazorpayConfig() {
  let keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "";
  let keySecret = process.env.RAZORPAY_KEY_SECRET || "";

  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      content.split("\n").forEach((line) => {
        const parts = line.split("=");
        if (parts.length >= 2 && !line.trim().startsWith("#")) {
          const k = parts[0].trim();
          const v = parts.slice(1).join("=").trim();
          if (k === "RAZORPAY_KEY_ID" && !keyId) keyId = v;
          if (k === "VITE_RAZORPAY_KEY_ID" && !keyId) keyId = v;
          if (k === "RAZORPAY_KEY_SECRET" && !keySecret) keySecret = v;
        }
      });
    }
  } catch (e) {
    console.warn("[SubscriptionHandler] Env read notice:", e.message);
  }

  return { keyId, keySecret };
}

export async function fetchLiveSubscriptionsData() {
  const now = Date.now();
  if (cachedData && now - cachedTime < CACHE_TTL_MS) {
    return cachedData;
  }

  const { keyId, keySecret } = getRazorpayConfig();
  if (!keyId || !keySecret) {
    console.warn("[SubscriptionHandler] Missing Razorpay credentials");
    return {
      success: true,
      subscriptions: [],
      recurringPayments: [],
      plans: [],
      stats: { totalSubscribers: 0, totalRevenue: 0, activePlans: 0 },
    };
  }

  const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  try {
    // 1. Fetch Plans
    const plansRes = await fetch("https://api.razorpay.com/v1/plans?count=50", {
      headers: { Authorization: authHeader },
    });
    const plansJson = await plansRes.json();
    const plansMap = {};
    const plansList = (plansJson.items || []).map((p) => {
      const item = {
        id: p.id,
        name: p.item?.name || "Parivattan Subscription",
        amount: (p.item?.amount || 0) / 100,
        currency: p.item?.currency || "INR",
        period: p.period || "monthly",
        interval: p.interval || 1,
        description: p.item?.description || "",
      };
      plansMap[p.id] = item;
      return item;
    });

    // 2. Fetch Subscriptions
    const subsRes = await fetch("https://api.razorpay.com/v1/subscriptions?count=100", {
      headers: { Authorization: authHeader },
    });
    const subsJson = await subsRes.json();
    const rawSubs = subsJson.items || [];

    // 3. Fetch Payments
    const payRes = await fetch("https://api.razorpay.com/v1/payments?count=100", {
      headers: { Authorization: authHeader },
    });
    const payJson = await payRes.json();
    const rawPayments = payJson.items || [];

    // Filter recurring / subscription payments
    const recurringPayments = rawPayments
      .filter(
        (p) =>
          (p.description && p.description.toLowerCase().includes("subscription")) ||
          (p.notes && p.notes.donation_type === "monthly_recurring") ||
          (p.notes && p.notes.subscription_id) ||
          (p.description && p.description.toLowerCase().includes("(monthly)"))
      )
      .map((p) => ({
        id: p.id,
        amount: (p.amount || 0) / 100,
        currency: p.currency || "INR",
        status: p.status,
        method: p.method,
        email: p.email || "",
        contact: p.contact || "",
        description: p.description || "Recurring Payment",
        notes: p.notes || {},
        createdAt: new Date(p.created_at * 1000).toISOString(),
      }));

    // 4. Fetch Customers for subscriptions
    const customerIds = [...new Set(rawSubs.map((s) => s.customer_id).filter(Boolean))];
    const customerMap = {};

    await Promise.all(
      customerIds.map(async (cid) => {
        try {
          const cRes = await fetch(`https://api.razorpay.com/v1/customers/${cid}`, {
            headers: { Authorization: authHeader },
          });
          if (cRes.ok) {
            const cData = await cRes.json();
            customerMap[cid] = {
              name: cData.name || "",
              email: cData.email || "",
              contact: cData.contact || "",
            };
          }
        } catch (e) {
          // ignore individual customer fetch error
        }
      })
    );

    // Correlate Subscriptions
    const subscriptions = rawSubs.map((s) => {
      const plan = plansMap[s.plan_id] || {};
      const customer = s.customer_id ? customerMap[s.customer_id] : null;

      // Find matching payments
      const matchedPayments = recurringPayments.filter(
        (p) =>
          (customer?.email && p.email && p.email.toLowerCase() === customer.email.toLowerCase()) ||
          (customer?.contact && p.contact && p.contact === customer.contact) ||
          p.notes?.subscription_id === s.id
      );

      const latestPayment = matchedPayments[0];
      const subscriberEmail = customer?.email || latestPayment?.email || s.notes?.email || "";
      const subscriberPhone = customer?.contact || latestPayment?.contact || s.notes?.phone || "";
      const subscriberName = customer?.name || s.notes?.name || (subscriberEmail ? subscriberEmail.split("@")[0] : "Subscriber");

      const planAmount = plan.amount || (matchedPayments[0]?.amount) || 135;
      const totalPaidAmount = s.paid_count > 0 ? s.paid_count * planAmount : matchedPayments.filter((m) => m.status === "captured").reduce((sum, m) => sum + m.amount, 0);

      return {
        id: s.id,
        planId: s.plan_id,
        planName: plan.name || "Parivattan Sathi",
        planAmount,
        currency: plan.currency || "INR",
        period: plan.period || "monthly",
        status: s.status, // active, created, completed, cancelled, paused
        totalCount: s.total_count || 12,
        paidCount: s.paid_count || (matchedPayments.filter((m) => m.status === "captured").length),
        remainingCount: s.remaining_count || Math.max(0, (s.total_count || 12) - (s.paid_count || 0)),
        subscriberName,
        subscriberEmail,
        subscriberPhone,
        totalPaidAmount,
        chargeAt: s.charge_at ? new Date(s.charge_at * 1000).toISOString() : null,
        currentStart: s.current_start ? new Date(s.current_start * 1000).toISOString() : null,
        currentEnd: s.current_end ? new Date(s.current_end * 1000).toISOString() : null,
        createdAt: new Date(s.created_at * 1000).toISOString(),
        paymentCount: matchedPayments.length,
      };
    });

    const totalRevenue = recurringPayments
      .filter((p) => p.status === "captured")
      .reduce((sum, p) => sum + p.amount, 0);

    const stats = {
      totalSubscribers: subscriptions.length,
      activeSubscribers: subscriptions.filter((s) => s.status === "active" || s.paidCount > 0).length,
      totalRevenue,
      totalTransactions: recurringPayments.filter((p) => p.status === "captured").length,
      plansCount: plansList.length,
    };

    const result = {
      success: true,
      subscriptions,
      recurringPayments,
      plans: plansList,
      stats,
      cachedAt: new Date().toISOString(),
    };

    cachedData = result;
    cachedTime = now;
    return result;
  } catch (err) {
    console.error("[SubscriptionHandler] Error fetching data:", err);
    return {
      success: false,
      error: err.message,
      subscriptions: cachedData?.subscriptions || [],
      recurringPayments: cachedData?.recurringPayments || [],
      plans: cachedData?.plans || [],
      stats: cachedData?.stats || { totalSubscribers: 0, totalRevenue: 0 },
    };
  }
}

export async function handleSubscriptionsRequest(req, res) {
  // Handle CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  try {
    const data = await fetchLiveSubscriptionsData();
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 200;
    return res.end(JSON.stringify(data));
  } catch (err) {
    console.error("[SubscriptionsRequest] Handler error:", err);
    res.setHeader("Content-Type", "application/json");
    res.statusCode = 500;
    return res.end(JSON.stringify({ success: false, error: err.message }));
  }
}

