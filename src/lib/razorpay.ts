export const LIVE_RAZORPAY_KEY_ID = "rzp_live_Tlq7NGeKnZ2WlX";

export const getRazorpayKeyId = (): string =>
  import.meta.env.VITE_RAZORPAY_KEY_ID ||
  import.meta.env.RAZORPAY_KEY_ID ||
  LIVE_RAZORPAY_KEY_ID;

export const loadRazorpay = () =>
  new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(
      'script[src*="checkout.razorpay.com"]'
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () =>
        reject(new Error("Unable to load Razorpay checkout."))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Unable to load Razorpay checkout."));
    document.body.appendChild(script);
  });

export interface MonthlyDonationPlan {
  amount: number;
  label: string;
  url: string;
  subscriptionId: string;
}

export const MONTHLY_DONATION_PLANS: MonthlyDonationPlan[] = [
  {
    amount: 500,
    label: "₹500 / month",
    url: "https://rzp.io/rzp/mges4uW",
    subscriptionId: "sub_TsuQH7PR7H9Oa9",
  },
  {
    amount: 1000,
    label: "₹1,000 / month",
    url: "https://rzp.io/rzp/CLAeAJf",
    subscriptionId: "sub_TsuSXRDiIjEtkC",
  },
  {
    amount: 2000,
    label: "₹2,000 / month",
    url: "https://rzp.io/rzp/AMbOfd9g",
    subscriptionId: "sub_TsuToNUP9oCXI8",
  },
  {
    amount: 5000,
    label: "₹5,000 / month",
    url: "https://rzp.io/rzp/Q3RNQ0b",
    subscriptionId: "sub_TsubXOBeWzUNst",
  },
];

export interface RazorpayCheckoutOptions {
  amount?: number;
  subscriptionId?: string;
  name?: string;
  description?: string;
  image?: string;
  recurring?: boolean;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  themeColor?: string;
  onSuccess: (response: {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
    razorpay_subscription_id?: string;
  }) => void;
  onDismiss?: () => void;
  onError?: (error: unknown) => void;
}

export const openRazorpayPayment = async (
  options: RazorpayCheckoutOptions
): Promise<void> => {
  try {
    await loadRazorpay();
    const key = getRazorpayKeyId();

    if (!window.Razorpay) {
      throw new Error("Razorpay SDK not loaded on window.");
    }

    const rzpOptions: Record<string, any> = {
      key,
      name: options.name || "Parivattan Mission Foundation",
      description: options.description || "Donation",
      image: options.image || "/img/parivattanE.png",
      prefill: options.prefill || {},
      notes: options.notes || {},
      theme: {
        color: options.themeColor || "#b5623b",
      },
      handler: (response: any) => {
        options.onSuccess(response);
      },
      modal: {
        ondismiss: () => {
          if (options.onDismiss) {
            options.onDismiss();
          }
        },
      },
    };

    if (options.subscriptionId) {
      rzpOptions.subscription_id = options.subscriptionId;
    } else if (options.amount) {
      rzpOptions.amount = Math.round(options.amount * 100);
      rzpOptions.currency = "INR";
    }

    if (options.recurring) {
      rzpOptions.recurring = 1;
      rzpOptions.notes = {
        ...rzpOptions.notes,
        donation_type: "monthly_recurring",
      };
    }

    const rzp = new window.Razorpay(rzpOptions);
    rzp.open();
  } catch (error) {
    if (options.onError) {
      options.onError(error);
    } else {
      throw error;
    }
  }
};

export const fetchRazorpaySubscriptionsCount = async () => 0;
