import { Router } from "express";
import authRoutes from "./auth/auth.routes.js";
import userRoutes from "./user/user.routes.js";

const router = Router();

// Register all module routes here
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;