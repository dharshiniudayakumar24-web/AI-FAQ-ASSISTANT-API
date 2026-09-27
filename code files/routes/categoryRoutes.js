import { Router } from "express";
import { body, param } from "express-validator";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory
} from "../controllers/categoryController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/", getCategories);

router.post(
  "/",
  protect,
  authorize("admin"),
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Category name is required"),
    body("description").optional().trim()
  ],
  validate,
  createCategory
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  [
    param("id").isMongoId().withMessage("Invalid category id"),
    body("name").trim().isLength({ min: 2 }).withMessage("Category name is required")
  ],
  validate,
  updateCategory
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  [param("id").isMongoId().withMessage("Invalid category id")],
  validate,
  deleteCategory
);

export default router;
