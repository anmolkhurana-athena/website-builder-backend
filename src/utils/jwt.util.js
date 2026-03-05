import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { TOKEN_EXPIRY } from "../constants/auth.constants.js";

dotenv.config({ quiet: true });

export const generateAccessToken = (payload) => {
  const expiresIn = TOKEN_EXPIRY.ACCESS_TOKEN;
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error("Invalid token");
  }
};