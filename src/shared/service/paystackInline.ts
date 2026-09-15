// Directory: src/shared/services
// Paystack Inline — opens the hosted-checkout overlay inside the app's own
// WebView (an embedded iframe) instead of handing off to the system browser.
// The backend's /api/activation/paystack/initialize already created the
// transaction server-side; we only need the returned `accessCode` + the
// Paystack *public* key (never the secret key) to drive the overlay here.

const SDK_URL = 'https://js.paystack.co/v1/inline.js';
const PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ?? '';

export interface PaystackInlineOptions {
  /** Returned by POST /api/activation/paystack/initialize — binds the
   * overlay to the server-created transaction. */
  accessCode: string;
  /** Fired once Paystack confirms the transaction succeeded. */
  onSuccess: (reference: string) => void;
  /** Fired when the user dismisses the overlay without a successful callback. */
  onClose: () => void;
}

/** Minimal surface of js.paystack.co/v1/inline.js that we rely on. */
interface PaystackPopHandler {
  openIframe(): void;
  openPopup(): void;
}

interface PaystackPopConstructor {
  setup(options: {
    key: string;
    accessCode?: string;
    onClose?: () => void;
    /** response.reference is the transaction reference on success. */
    callback?: (response: { reference: string }) => void;
  }): PaystackPopHandler;
}

declare global {
  interface Window {
    PaystackPop?: PaystackPopConstructor;
  }
}

let sdkPromise: Promise<void> | null = null;

function loadSdk(): Promise<void> {
  if (typeof window !== 'undefined' && window.PaystackPop) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error('Could not load the Paystack payment SDK. Check your connection.'));
    };
    document.head.appendChild(script);
  });
  return sdkPromise;
}

/** Opens the Paystack inline overlay for a server-created transaction. */
export async function openPaystackInline({
  accessCode,
  onSuccess,
  onClose,
}: PaystackInlineOptions): Promise<void> {
  if (!PUBLIC_KEY) {
    throw new Error('Paystack public key is not configured. Set VITE_PAYSTACK_PUBLIC_KEY.');
  }
  await loadSdk();

  const handler = window.PaystackPop!.setup({
    key: PUBLIC_KEY,
    accessCode,
    onClose,
    callback: (response) => onSuccess(response.reference),
  });

  // Iframe keeps the user inside the app; openPopup is only used as a fallback
  // for desktop-web dev where the embedded modal can misbehave.
  try {
    handler.openIframe();
  } catch {
    handler.openPopup();
  }
}