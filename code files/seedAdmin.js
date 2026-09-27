import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env");
    }

    const existing = await User.findOne({ email });

    if (existing) {
      existing.role = "admin";
      existing.password = password;
      await existing.save();
      console.log("Existing user promoted to admin.");
    } else {
      await User.create({
        name: "System Admin",
        email,
        password,
        role: "admin"
      });
      console.log("Admin account created.");
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
