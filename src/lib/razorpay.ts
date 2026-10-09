
export const LIVE_RAZORPAY_KEY_ID = "rzp_live_Tlq7NGeKnZ2WlX";

export const getRazorpayKeyId = (): string => 
  import.meta.env.VITE_RAZORPAY_KEY_ID || 
  import.meta.env.RAZORPAY_KEY_ID || 
  LIVE_RAZORPAY_KEY_ID;

export const loadRazorpay = () => new Promise<void>((resolve, reject) => {
  if (window.Razorpay) {
    resolve();
    return;
  }

  const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
  if (existingScript) {
    existingScript.addEventListener("load", () => resolve());
    existingScript.addEventListener("error", () => reject(new Error("Unable to load Razorpay checkout.")));
    return;
  }

  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;
  script.onload = () => resolve();
  script.onerror = () => reject(new Error("Unable to load Razorpay checkout."));
  document.body.appendChild(script);
});

export interface RazorpayCheckoutOptions {
  amount: number; // in INR (will be converted to paise)
  name?: string;
  description?: string;
  image?: string;
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
  }) => void;
  onDismiss?: () => void;
  onError?: (error: unknown) => void;
}

export const openRazorpayPayment = async (options: RazorpayCheckoutOptions): Promise<void> => {
  try {
    await loadRazorpay();
    const key = getRazorpayKeyId();

    if (!window.Razorpay) {
      throw new Error("Razorpay SDK not loaded on window.");
    }

    const rzpOptions = {
      key,
      amount: Math.round(options.amount * 100), // paise
      currency: "INR",
      name: options.name || "Parivattan Mission Foundation",
      description: options.description || "Educational Contribution / Fee",
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

