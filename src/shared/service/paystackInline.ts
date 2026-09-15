// Directory: src/shared/services
// Paystack Inline (Popup V2) — resumes, inside the app's own WebView, a
// transaction that /api/activation/paystack/initialize already created
// server-side. resumeTransaction(accessCode) is the purpose-built method
// for exactly this "initialize on the server, finish on the client"
// flow — see https://paystack.com/docs/developer-tools/inlinejs/#resume-transaction.
//
// We deliberately do NOT use Popup V1 (js.paystack.co/v1/inline.js) here.
// V1's setup()+openIframe() builds a brand-new client-side transaction and
// expects `email`/`amount` up front; feeding it an accessCode instead sends
// a malformed POST to /checkout/request_inline, which Paystack 400s with
// "Please enter a valid email address" and then marks the transaction
// `abandoned` server-side — that's the bug this file used to have.
//
// No public key is needed on the client for this flow either: the key,
// amount, and email were already supplied by the backend when it created
// the transaction, so resumeTransaction only needs the accessCode.

const SDK_URL = 'https://js.paystack.co/v2/inline.js';

export interface PaystackInlineOptions {
  /** Returned by POST /api/activation/paystack/initialize — binds the
   * overlay to the server-created transaction. */
  accessCode: string;
  /** Fired once Paystack confirms the transaction succeeded. */
  onSuccess: (reference: string) => void;
  /** Fired when the user dismisses the overlay, or the transaction fails to
   * load/complete, without a successful callback. */
  onClose: () => void;
}

/** Minimal surface of js.paystack.co/v2/inline.js that we rely on. */
interface PaystackPopInstance {
  resumeTransaction(
    accessCode: string,
    options?: {
      /** transaction.reference is the payment reference on success. */
      onSuccess?: (transaction: { reference: string }) => void;
      onCancel?: () => void;
      onError?: (error: { message: string }) => void;
    }
  ): void;
}

interface PaystackPopConstructor {
  new (): PaystackPopInstance;
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

/** Resumes the server-initialized Paystack transaction inline, in-app. */
export async function openPaystackInline({
  accessCode,
  onSuccess,
  onClose,
}: PaystackInlineOptions): Promise<void> {
  await loadSdk();

  const PaystackPopCtor = window.PaystackPop;
  if (!PaystackPopCtor) {
    throw new Error('Paystack payment SDK failed to initialize.');
  }

  const popup = new PaystackPopCtor();
  popup.resumeTransaction(accessCode, {
    onSuccess: (transaction) => onSuccess(transaction.reference),
    onCancel: onClose,
    // A load/setup failure leaves the user stuck looking at the Popup's own
    // error state with no way back into our UI — treat it the same as a
    // cancel so the caller's "Opening payment…" state doesn't hang forever.
    onError: () => onClose(),
  });
}