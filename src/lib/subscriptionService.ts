/**
 * ============================================================================
 * PARIVATTAN MISSION FOUNDATION - SUBSCRIPTIONS & MEMBERSHIPS SERVICE
 * ============================================================================
 * Fetches and manages recurring monthly donors, Parivattan Sathi subscribers,
 * and automated Razorpay subscription plans.
 */

export interface SubscriptionItem {
  id: string;
  planId: string;
  planName: string;
  planAmount: number;
  currency: string;
  period: string;
  status: "active" | "created" | "completed" | "cancelled" | "paused" | string;
  totalCount: number;
  paidCount: number;
  remainingCount: number;
  subscriberName: string;
  subscriberEmail: string;
  subscriberPhone: string;
  totalPaidAmount: number;
  chargeAt?: string | null;
  currentStart?: string | null;
  currentEnd?: string | null;
  createdAt: string;
  paymentCount: number;
}

export interface RecurringPaymentItem {
  id: string;
  amount: number;
  currency: string;
  status: "captured" | "failed" | "refunded" | string;
  method: string;
  email: string;
  contact: string;
  description: string;
  notes: Record<string, any>;
  createdAt: string;
}

export interface SubscriptionPlanItem {
  id: string;
  name: string;
  amount: number;
  currency: string;
  period: string;
  interval: number;
  description?: string;
}

export interface SubscriptionStats {
  totalSubscribers: number;
  activeSubscribers: number;
  totalRevenue: number;
  totalTransactions: number;
  plansCount: number;
}

export interface SubscriptionResponse {
  success: boolean;
  subscriptions: SubscriptionItem[];
  recurringPayments: RecurringPaymentItem[];
  plans: SubscriptionPlanItem[];
  stats: SubscriptionStats;
  cachedAt?: string;
  error?: string;
}

const LOCAL_STORAGE_KEY = "parivattan_cached_subscriptions";

/**
 * Fetch live subscriptions from backend endpoint
 */
export async function getSubscriptionsData(
  forceRefresh = false
): Promise<SubscriptionResponse> {
  // If not forcing refresh, check local cache first for instant UI response
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.subscriptions)) {
          // Trigger background fetch and return cached immediately
          fetchRemoteSubscriptions().catch(() => {});
          return parsed;
        }
      }
    } catch {}
  }

  return fetchRemoteSubscriptions();
}

async function fetchRemoteSubscriptions(): Promise<SubscriptionResponse> {
  const endpoints = [
    "/api/subscriptions",
    "https://www.parivattan.org/api/subscriptions",
  ];

  let lastError = "";

  for (const url of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data: SubscriptionResponse = await res.json();
        if (data.success && Array.isArray(data.subscriptions)) {
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
          } catch {}
          return data;
        }
      }
    } catch (e: any) {
      lastError = e?.message || "Failed to reach endpoint";
    }
  }

  // Fallback: Return cached or sensible default
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch {}

  return {
    success: false,
    error: lastError || "Could not connect to subscriptions service",
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
  };
}

