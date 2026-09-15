// Directory: src/shared/services
import algosdk from "algosdk";
import { PeraWalletConnect } from "@perawallet/connect";
import type {
  AlgoQuote,
  VerifyCryptoPaymentRequest,
  VerifyCryptoPaymentResponse,
} from "../types/algorand.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";
const ALGOD_SERVER = import.meta.env.VITE_ALGOD_SERVER ?? "https://mainnet-api.algonode.cloud";
const ALGORAND_CHAIN_ID = Number(import.meta.env.VITE_ALGORAND_CHAIN_ID ?? 416001) as
  | 416001 | 416002 | 416003 | 4160;
const RECEIVE_ADDRESS = import.meta.env.VITE_ECOCYCLE_ALGO_ADDRESS ?? "";

const ONCE_OFF_ACCESS_FEE_ZAR = 150;

export const algod = new algosdk.Algodv2("", ALGOD_SERVER, "");

// Module-level singleton — do NOT re-instantiate per render/hook call,
// or you'll end up with duplicate WalletConnect sessions.
export const peraWallet = new PeraWalletConnect({ chainId: ALGORAND_CHAIN_ID });

export const reconnectPeraSession = () => peraWallet.reconnectSession();
export const connectPeraWallet = () => peraWallet.connect();
export const disconnectPeraWallet = () => peraWallet.disconnect();

/**
 * Live ZAR→ALGO quote. In production, prefer having the backend own and pin this
 * quote for a short window — the on-chain verification step below is what actually
 * protects you either way, since it checks the real settled amount.
 */
export async function getOnceOffFeeAlgoQuote(): Promise<AlgoQuote> {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=algorand&vs_currencies=zar"
  );
  if (!response.ok) throw new Error("Could not fetch ALGO/ZAR exchange rate.");
  const data = await response.json();
  const zarPerAlgo = data.algorand.zar as number;
  const amountAlgos = ONCE_OFF_ACCESS_FEE_ZAR / zarPerAlgo;
  return {
    amountMicroAlgos: Math.round(amountAlgos * 1_000_000),
    algoPerZar: 1 / zarPerAlgo,
    quotedAt: Date.now(),
  };
}

export async function buildOnceOffFeePaymentTxn(
  fromAddress: string,
  amountMicroAlgos: number,
  reference: string
) {
  if (!RECEIVE_ADDRESS) throw new Error("EcoCycle receiving wallet address is not configured.");
  const suggestedParams = await algod.getTransactionParams().do();
  return algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: fromAddress,
    receiver: RECEIVE_ADDRESS,
    amount: amountMicroAlgos,
    note: new TextEncoder().encode(`EcoCycle once-off fee:${reference}`),
    suggestedParams,
  });
}

export async function signAndSubmitOnceOffFeePayment(
  txn: algosdk.Transaction,
  fromAddress: string
): Promise<string> {
  const signedTxns = await peraWallet.signTransaction([[{ txn, signers: [fromAddress] }]]);
  const { txid } = await algod.sendRawTransaction(signedTxns).do();
  await algosdk.waitForConfirmation(algod, txid, 8);
  return txid;
}

/** Backend independently confirms the on-chain transaction before granting access. */
export async function verifyCryptoOnceOffFee(
  request: VerifyCryptoPaymentRequest
): Promise<VerifyCryptoPaymentResponse> {
  const response = await fetch(`${API_BASE_URL}/api/payments/once-off-fee/verify-crypto`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error(`Could not verify crypto payment (${response.status})`);
  return response.json();
}