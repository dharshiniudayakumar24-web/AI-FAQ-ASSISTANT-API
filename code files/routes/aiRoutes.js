import { Router } from "express";
import { body, param } from "express-validator";
import {
  generateFAQWithAI,
  saveGeneratedFAQ,
  answerQuestionWithAI,
  getAIGeneratedFAQs
} from "../controllers/aiController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.post(
  "/generate-faq",
  protect,
  authorize("admin", "content_creator"),
  [
    body("prompt").trim().isLength({ min: 3, max: 1000 })
      .withMessage("Prompt must contain 3 to 1000 characters")
  ],
  validate,
  generateFAQWithAI
);

router.post(
  "/generated/:id/save",
  protect,
  authorize("admin", "content_creator"),
  [
    param("id").isMongoId().withMessage("Invalid generated FAQ id"),
    body("categoryId").isMongoId().withMessage("Valid categoryId is required"),
    body("tags").optional().isArray(),
    body("isPublic").optional().isBoolean()
  ],
  validate,
  saveGeneratedFAQ
);

router.get(
  "/generated",
  protect,
  authorize("admin", "content_creator"),
  getAIGeneratedFAQs
);

router.post(
  "/answer",
  protect,
  [
    body("question").trim().isLength({ min: 3, max: 1000 })
      .withMessage("Question must contain 3 to 1000 characters")
  ],
  validate,
  answerQuestionWithAI
);

export default router;
