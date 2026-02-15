import axios from "axios";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

interface InitializePaymentParams {
    email: string;
    amount: number; // Amount in kobo (smallest currency unit)
    reference: string;
    metadata?: Record<string, any>;
    callback_url?: string;
}

interface PaystackResponse {
    status: boolean;
    message: string;
    data: any;
}

class PaystackService {
    private secretKey: string;

    constructor() {
        this.secretKey = process.env.PAYSTACK_SECRET_KEY || "";
        if (!this.secretKey) {
            throw new Error("PAYSTACK_SECRET_KEY is not defined in environment variables");
        }
    }

    /**
     * Initialize a payment transaction
     */
    async initializePayment(params: InitializePaymentParams): Promise<PaystackResponse> {
        try {
            const response = await axios.post(
                `${PAYSTACK_BASE_URL}/transaction/initialize`,
                params,
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            console.error("Paystack Initialize Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Failed to initialize payment");
        }
    }

    /**
     * Verify a payment transaction
     */
    async verifyPayment(reference: string): Promise<PaystackResponse> {
        try {
            const response = await axios.get(
                `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            console.error("Paystack Verify Error:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Failed to verify payment");
        }
    }

    /**
     * Verify webhook signature
     */
    verifyWebhookSignature(payload: string, signature: string): boolean {
        const crypto = require("crypto");
        const hash = crypto
            .createHmac("sha512", this.secretKey)
            .update(payload)
            .digest("hex");

        return hash === signature;
    }
}

export default new PaystackService();
