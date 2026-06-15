import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export const generateToken = (
  payload: Object,
  expiresIn?: StringValue | number,
): string => {
  // jwt.sign creates a signed token using our secret key from environment variables
  // expiresIn defines how long the token is valid (defaults to 1 hour)
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn ?? "1h" });
};

export const verifyToken = (token: string) => {
  // jwt.verify verifies the token using our secret key from environment variables
  return jwt.verify(token, JWT_SECRET);
};
