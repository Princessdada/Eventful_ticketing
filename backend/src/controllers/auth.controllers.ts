import type { Request, Response } from "express";
import User from "../models/user.models.js"
import { signToken } from "../utils/jwt.js";
import bcrypt from "bcryptjs";

export const signup = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }
        const user = new User({ name, email, password, role });
        await user.save();
        const token = signToken({ id: user._id, role: user.role });

        res.status(201).json({
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            token
        });
    } catch (error) {
        console.error("Signup Error:", error);
        console.error("Error details:", {
            message: (error as Error).message,
            stack: (error as Error).stack,
            name: (error as Error).name
        });
        res.status(500).json({ message: "Server error" });
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = signToken({ id: user._id, role: user.role });

        res.json({
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
            token
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}