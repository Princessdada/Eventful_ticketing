
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = "http://localhost:8000/api";

async function runTests() {
    try {
        const timestamp = Date.now();
        const email = `test_qr_${timestamp}@example.com`;
        const password = "password123";
        let token = "";
        let eventId = "";
        let bookingId = "";
        let qrCodeUrl = "";

        console.log("--- STARTING QR SYSTEM TESTS ---\n");

        // 1. Signup User
        console.log("1. Signing up user...");
        const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "QR Test User", email, password, role: "attendee" })
        });
        const signupData = await signupRes.json();
        token = signupData.token;
        if (!token) throw new Error("Signup failed: No token received");
        console.log("✅ User signed up, token received.\n");

        // 2. Create an Event
        console.log("2. Creating an event (as creator)...");
        const creatorEmail = `creator_qr_${timestamp}@example.com`;
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
                title: "QR Test Event",
                description: "Testing QR generation",
                date: new Date(Date.now() + 86400000).toISOString(),
                location: "Virtual",
                price: 10
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
        console.log("DEBUG: bookingData:", JSON.stringify(bookingData, null, 2));
        if (bookingRes.status !== 201) {
            console.error("Booking Creation Failed:", bookingData);
            throw new Error(`Booking creation failed with status ${bookingRes.status}`);
        }
        bookingId = bookingData.booking._id;
        qrCodeUrl = bookingData.booking.qrCodeUrl;
        console.log(`✅ Booking created. ID: ${bookingId}, QR Code URL: ${qrCodeUrl}\n`);

        // 4. Fetch QR Code
        console.log("4. Fetching QR Code...");
        const qrRes = await fetch(`http://localhost:8000${qrCodeUrl}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const qrData = await qrRes.json();

        if (qrRes.status === 200 && qrData.qrCode.startsWith("data:image/png;base64,")) {
            console.log("✅ SUCCESS: QR Code fetched successfully as a Data URL.");
            // console.log("QR Data URL snippet:", qrData.qrCode.substring(0, 50) + "...");
        } else {
            console.error("QR Fetch Response:", qrData);
            throw new Error("Failed to fetch valid QR code");
        }

        console.log("\n--- QR SYSTEM TESTS PASSED SUCCESSFULLY ---");

    } catch (error) {
        console.error("\n❌ TEST FAILED:");
        console.error(error.message);
        process.exit(1);
    }
}

runTests();
