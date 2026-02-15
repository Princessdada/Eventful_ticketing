
async function run() {
    try {
        console.log("1. Testing unauthenticated request...");
        const res1 = await fetch("http://localhost:8000/api/test-auth");
        console.log(`Status: ${res1.status}`);

        console.log("\n2. Signing up user...");
        const email = `test_${Date.now()}@example.com`;
        const res2 = await fetch("http://localhost:8000/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Tester", email, password: "password", role: "user" })
        });

        if (res2.status !== 201) {
            const err = await res2.text();
            console.error("Signup failed:", res2.status, err);
            return;
        }

        const data = await res2.json();
        if (!data.token) {
            console.error("No token received", data);
            return;
        }
        const token = data.token;
        console.log("Token received.");

        console.log("\n3. Testing authenticated request...");
        const res3 = await fetch("http://localhost:8000/api/test-auth", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        console.log(`Status: ${res3.status}`);
        const text = await res3.text();
        console.log(`Response: ${text}`);
    } catch (error) {
        console.error("Error:", error);
    }
}

run();
