import { Router } from "express";
import { param, body } from "express-validator";
import { getUsers, updateUser, deleteUser } from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/", protect, authorize("admin"), getUsers);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  [
    param("id").isMongoId().withMessage("Invalid user id"),
    body("name").trim().isLength({ min: 2 }).withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("role").isIn(["admin", "content_creator", "user"]).withMessage("Invalid role")
  ],
  validate,
  updateUser
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  [param("id").isMongoId().withMessage("Invalid user id")],
  validate,
  deleteUser
);

export default router;
