import { Router } from "express";
import { body } from "express-validator";
import { createFeedback, getFeedback } from "../controllers/feedbackController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post(
  "/",
  protect,
  [
    body("faqId").isMongoId().withMessage("Valid faqId is required"),
    body("helpful").isBoolean().withMessage("helpful must be boolean"),
    body("comment").optional().trim()
  ],
  validate,
  createFeedback
);

router.get("/", protect, authorize("admin"), getFeedback);

export default router;
