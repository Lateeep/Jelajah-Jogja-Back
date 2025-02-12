import express from "express";
import {
  getAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  Login,
  Logout
} from "../controllers/AdminController.js";

const router = express.Router();

router.get("/getadmin/:token", getAdmin);
router.post("/registrasi", createAdmin);
router.put("/editadmin/:token", updateAdmin);
router.delete("/deleteadmin/:token", deleteAdmin);
router.post("/login", Login);
router.delete("/logout/:token", Logout);
export default router;
