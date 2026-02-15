import dotenv from "dotenv";
dotenv.config();

import connectDB from "./src/config/db.js";
import User from "./src/models/user.models.js";

const testSignup = async () => {
    try {
        await connectDB();
        console.log("Database connected successfully");

        const testUser = {
            name: "Debug Test User",
            email: "debugtest@example.com",
            password: "password123",
            role: "creator"
        };

        console.log("Creating user with data:", testUser);

        const user = new User(testUser);
        console.log("User instance created:", user);

        await user.save();
        console.log("User saved successfully:", {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });

        process.exit(0);
    } catch (error) {
        console.error("ERROR OCCURRED:");
        console.error("Error:", error);
        console.error("Error message:", (error as Error).message);
        console.error("Error stack:", (error as Error).stack);
        console.error("Error name:", (error as Error).name);
        process.exit(1);
    }
};

testSignup();
