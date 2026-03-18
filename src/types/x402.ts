export interface PaymentRequirement {
  x402Version: number;
  schemes: PaymentScheme[];
}

export interface PaymentScheme {
  scheme: "exact";
  network: string;
  maxAmountRequired: string;
  resource: string;
  description: string;
  mimeType: string;
  payTo: string;
  requiredDeadlineSeconds: number;
  outputSchema: null;
  extra: {
    name: string;
    token: string;
  };
}

export interface PaymentReceipt {
  transactionSig: string;
  amount: string;
  payer: string;
  payee: string;
  timestamp: string;
  network: string;
}

export interface X402PaymentState {
  isPaying: boolean;
  paymentRequired: PaymentRequirement | null;
  error: string | null;
}
