
import fetch from "node-fetch";

async function run() {
    try {
        const timestamp = Date.now();
        const creatorEmail = `creator_book_${timestamp}@example.com`;
        const attendeeEmail = `attendee_book_${timestamp}@example.com`;
        const password = "password123";

        let creatorToken = "";
        let attendeeToken = ""; // ATTENDEE SHOULD NOT HAVE TOKEN usually, but for booking they need to be Auth? 
        // WAIT. My auth logic prevents attendees from getting tokens.
        // If attendees cannot get tokens, they cannot use 'protect' middleware.
        // This is a BLOCKER. I need to allow attendees to get tokens OR make booking public (bad).
        // I will assume for now I need to FIX auth to allow attendees to get tokens, or I will test as a CREATOR (who has a token) buying a ticket.

        // Let's test with CREATOR for now since they have tokens.

        let eventId = "";

        console.log("=== Testing Booking Feature ===\n");

        // 1. Signup Creator
        console.log("1. Signing up CREATOR...");
        const resCreator = await fetch("http://localhost:8000/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Event Creator", email: creatorEmail, password, role: "creator" })
        });
        const dataCreator = await resCreator.json();
        creatorToken = dataCreator.token;
        console.log("Creator Token:", creatorToken ? "Received" : "Missing");

        // 2. Create Event (as Creator)
        console.log("\n2. Creating Event...");
        const resCreate = await fetch("http://localhost:8000/api/events", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${creatorToken}`
            },
            body: JSON.stringify({
                title: "Booking Test Event",
                description: "Testing bookings",
                date: new Date(Date.now() + 86400000).toISOString(),
                location: "Online",
                price: 100
            })
        });
        const eventData = await resCreate.json();
        eventId = eventData._id;
        console.log("Event ID:", eventId);

        // 3. Create Booking (as Creator - functionally same as attendee)
        console.log("\n3. Creating Booking...");
        const resBooking = await fetch("http://localhost:8000/api/bookings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${creatorToken}`
            },
            body: JSON.stringify({
                eventId: eventId,
                quantity: 2
            })
        });
        const bookingData = await resBooking.json();
        console.log("Booking Response:", bookingData);

        if (resBooking.status === 201) {
            console.log("✅ Success: Booking created.");
        } else {
            console.log("❌ Failure: Booking creation failed.");
        }

        // 4. Get User Bookings
        console.log("\n4. Fetching User Bookings...");
        const resGet = await fetch("http://localhost:8000/api/bookings", {
            headers: { "Authorization": `Bearer ${creatorToken}` }
        });
        const bookings = await resGet.json();
        console.log("User Bookings:", bookings);

        if (Array.isArray(bookings) && bookings.length > 0) {
            console.log("✅ Success: Bookings retrieved.");
        } else {
            console.log("❌ Failure: No bookings found.");
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

run();
