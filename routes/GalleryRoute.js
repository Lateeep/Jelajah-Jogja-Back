import express from "express";
import {
  getGalleryById,
  getGalleryByWisataId,
  createGallery,
  deleteGallery
} from "../controllers/GalleryController.js";

const router = express.Router();

router.get("/getgallerybyid/:id", getGalleryById);
router.get("/getgallerybywisataid/:id", getGalleryByWisataId);
router.post("/creategallery/:id", createGallery);
router.delete("/deletegallery/:id", deleteGallery);

export default router;
