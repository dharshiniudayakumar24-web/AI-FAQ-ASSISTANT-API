import { Router } from "express";
import authRoutes from "./authRoutes.js";
import faqRoutes from "./faqRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import aiRoutes from "./aiRoutes.js";
import userRoutes from "./userRoutes.js";
import feedbackRoutes from "./feedbackRoutes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/faqs", faqRoutes);
router.use("/categories", categoryRoutes);
router.use("/ai", aiRoutes);
router.use("/users", userRoutes);
router.use("/feedback", feedbackRoutes);

export default router;
