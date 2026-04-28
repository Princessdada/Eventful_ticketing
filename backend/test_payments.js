
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = "http://localhost:8000/api";
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

async function runTests() {
    try {
        const timestamp = Date.now();
        const email = `test_pay_${timestamp}@example.com`;
        const password = "password123";
        let token = "";
        let eventId = "";
        let bookingId = "";
        let paymentReference = "";

        console.log("--- STARTING PAYMENT ENDPOINT TESTS ---\n");

        // 1. Signup User
        console.log("1. Signing up user...");
        const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Test User", email, password, role: "attendee" })
        });
        const signupData = await signupRes.json();
        token = signupData.token;
        if (!token) throw new Error("Signup failed: No token received");
        console.log("✅ User signed up, token received.\n");

        // 2. Create an Event (Need a creator for this)
        console.log("2. Creating an event (as creator)...");
        const creatorEmail = `creator_${timestamp}@example.com`;
        const creatorSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Creator User", email: creatorEmail, password, role: "creator" })
        });
        const creatorData = await creatorSignupRes.json();
        const creatorToken = creatorData.token;

        const eventRes = await fetch(`${BASE_URL}/events`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${creatorToken}`
            },
            body: JSON.stringify({
                title: "Payment Test Event",
                description: "Testing payment flow",
                date: new Date(Date.now() + 86400000).toISOString(),
                location: "Virtual",
                price: 50
            })
        });
        const eventData = await eventRes.json();
        eventId = eventData._id;
        console.log(`✅ Event created with ID: ${eventId}\n`);

        // 3. Create a Booking
        console.log("3. Creating a booking...");
        const bookingRes = await fetch(`${BASE_URL}/bookings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ eventId, quantity: 1 })
        });
        const bookingData = await bookingRes.json();
        if (bookingRes.status !== 201) {
            console.error("Booking Creation Failed:", bookingData);
            throw new Error(`Booking creation failed with status ${bookingRes.status}`);
        }
        bookingId = bookingData.booking._id;
        console.log(`✅ Booking created with ID: ${bookingId}. Status: ${bookingData.booking.status}\n`);

        // 4. Initialize Payment
        console.log("4. Initializing payment...");
        const initRes = await fetch(`${BASE_URL}/payments/initialize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ bookingId })
        });

        const initText = await initRes.text();
        let initData;
        try {
            initData = JSON.parse(initText);
        } catch (e) {
            console.error("Failed to parse init response as JSON:", initText);
            throw new Error("Payment initialization returned non-JSON response");
        }

        if (initRes.status !== 200) {
            console.error("Init Error:", initData);
            throw new Error(`Payment initialization failed with status ${initRes.status}`);
        }
        paymentReference = initData.data.reference;
        console.log(`✅ Payment initialized. Reference: ${paymentReference}`);
        console.log(`🔗 Auth URL: ${initData.data.authorizationUrl}\n`);

        // 5. Simulate Webhook (Charge Success)
        console.log("5. Simulating Paystack Webhook (charge.success)...");
        const webhookPayload = {
            event: "charge.success",
            data: {
                reference: paymentReference,
                status: "success",
                amount: 5000, // in kobo
                currency: "NGN",
                channel: "card",
                customer: { email }
            }
        };

        const payloadString = JSON.stringify(webhookPayload);
        const signature = crypto
            .createHmac("sha512", PAYSTACK_SECRET_KEY)
            .update(payloadString)
            .digest("hex");

        const webhookRes = await fetch(`${BASE_URL}/payments/webhook`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-paystack-signature": signature
            },
            body: payloadString
        });

        if (webhookRes.status === 200) {
            console.log("✅ Webhook processed successfully.\n");
        } else {
            console.error("Webhook Error:", await webhookRes.text());
            throw new Error("Webhook processing failed");
        }

        // 6. Verify Booking Status
        console.log("6. Verifying booking status...");
        const verifyBookingRes = await fetch(`${BASE_URL}/bookings`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const userBookings = await verifyBookingRes.json();
        const updatedBooking = userBookings.find(b => b._id === bookingId);

        if (updatedBooking && updatedBooking.status === "confirmed") {
            console.log("✅ SUCCESS: Booking status is 'confirmed'.");
        } else {
            console.error("Current booking status:", updatedBooking?.status);
            throw new Error("Booking status not updated to confirmed");
        }

        console.log("\n--- ALL TESTS PASSED SUCCESSFULLY ---");

    } catch (error) {
        console.error("\n❌ TEST FAILED:");
        console.error(error.message);
        process.exit(1);
    }
}

runTests();
