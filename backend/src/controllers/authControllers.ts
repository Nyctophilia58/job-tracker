import User from "../models/User.js";
import { Request, Response } from "express";
import { generateToken, verifyToken } from "../services/jwtServices.js";
import { hashPassword, comparePassword } from "../services/hashServices.js";
import { sendResetEmail } from "../services/emailService.js";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    const token = generateToken({
      id: user._id,
      email: user.email,
      username: user.username,
    });
    res.status(201).json({ message: "User registered successfully", token });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }

    const token = generateToken({
      id: user._id,
      email: user.email,
      username: user.username,
    });
    res.json({ message: "Login successful!", token });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const profile = async (req: Request, res: Response): Promise<void> => {
  res.json({ message: "Welcome to your profile", user: req.user });
};

export const updateProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req.user as { id: string }).id;
    const { username, email } = req.body;

    if (!username || !email) {
      res.status(400).json({ error: "Username and email are required" });
      return;
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: userId },
    });
    if (existingUser) {
      res.status(400).json({ error: "Email already in use" });
      return;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { username, email },
      { new: true },
    );
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const token = generateToken({
      id: user._id,
      email: user.email,
      username: user.username,
    });
    res.json({
      message: "Profile updated successfully",
      user: { id: user._id, username: user.username, email: user.email },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req.user as { id: string }).id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res
        .status(400)
        .json({ error: "Current password and new password are required" });
      return;
    }

    if (newPassword.length < 6) {
      res
        .status(400)
        .json({ error: "New password must be at least 6 characters" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ error: "Current password is incorrect" });
      return;
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal that user doesn't exist
      res.json({
        message:
          "If an account with that email exists, a reset link has been sent.",
      });
      return;
    }

    const resetToken = generateToken({ id: user._id, purpose: "reset" }, "15m");

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;

    await sendResetEmail(email, resetUrl);

    res.json({
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: "Token and new password are required" });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    const decoded = verifyToken(token) as {
      id: string;
      purpose: string;
    };

    if (decoded.purpose !== "reset") {
      res.status(400).json({ error: "Invalid reset token" });
      return;
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    if ((err as Error).name === "TokenExpiredError") {
      res
        .status(400)
        .json({ error: "Reset link has expired. Please request a new one." });
      return;
    }
    res.status(400).json({ error: "Invalid or expired reset token" });
  }
};
