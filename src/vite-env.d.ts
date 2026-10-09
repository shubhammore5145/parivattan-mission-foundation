/// <reference types="vite/client" />

interface Window {
	Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
}

interface ImportMetaEnv {
	readonly VITE_SUPABASE_URL?: string;
	readonly VITE_SUPABASE_ANON_KEY?: string;
	readonly VITE_RAZORPAY_KEY_ID?: string;
	readonly RAZORPAY_KEY_ID?: string;
}
