import { Router } from "express";
import {
  register,
  login,
  profile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authControllers.js";
import { authMiddleware } from "../middleware/authMiddlewares.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, profile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
