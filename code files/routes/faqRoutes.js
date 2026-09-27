import { Router } from "express";
import { body, param } from "express-validator";
import {
  createFAQ,
  getFAQs,
  getFAQById,
  updateFAQ,
  deleteFAQ,
  search,
  getAllFAQsForAdmin,
  getMyFAQs
} from "../controllers/faqController.js";
import { protect, authorize, optionalAuth } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/", optionalAuth, getFAQs);
router.get("/search", optionalAuth, search);
router.get("/mine", protect, getMyFAQs);
router.get("/admin/all", protect, authorize("admin"), getAllFAQsForAdmin);

router.post(
  "/",
  protect,
  [
    body("question").trim().isLength({ min: 5 }).withMessage("Question is required"),
    body("answer").trim().isLength({ min: 2 }).withMessage("Answer is required"),
    body("categoryId").isMongoId().withMessage("Valid categoryId is required"),
    body("tags").optional().isArray().withMessage("tags must be an array"),
    body("isPublic").optional().isBoolean().withMessage("isPublic must be boolean")
  ],
  validate,
  (req, res, next) => {
    if (!["admin", "content_creator"].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Only admin or content creator can create FAQs"
      });
    }
    next();
  },
  createFAQ
);

router.get(
  "/:id",
  optionalAuth,
  [
    param("id").isMongoId().withMessage("Invalid FAQ id")
  ],
  validate,
  getFAQById
);

router.put(
  "/:id",
  protect,
  [
    param("id").isMongoId().withMessage("Invalid FAQ id"),
    body("question").optional().trim().isLength({ min: 5 }),
    body("answer").optional().trim().isLength({ min: 2 }),
    body("categoryId").optional().isMongoId(),
    body("tags").optional().isArray(),
    body("isPublic").optional().isBoolean()
  ],
  validate,
  updateFAQ
);

router.delete(
  "/:id",
  protect,
  [param("id").isMongoId().withMessage("Invalid FAQ id")],
  validate,
  deleteFAQ
);

export default router;
