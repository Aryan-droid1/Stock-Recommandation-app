
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Wallet from "../models/Wallet.js";

export const registerUser = async ({ name, email, password }) => {
  // Check whether user already exists
  const existingUser = await User.findOne({
    email: email.toLowerCase(),
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  try {
    // Automatically create virtual wallet
    const wallet = await Wallet.create({
      user: user._id,
      initialBalance: 100000,
      availableBalance: 100000,
      investedAmount: 0,
      totalPortfolioValue: 100000,
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      wallet,
    };
  } catch (error) {
    // Roll back user creation if wallet creation fails
    await User.deleteOne({ _id: user._id });
    throw error;
  }
};

export const loginUser = async ({ email, password }) => {
  // Find user
  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Compare password with stored hash
  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // Generate JWT
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    token,
  };
};

