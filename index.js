import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import AdminRoute from "./routes/AdminRoute.js";
import ReviewRoute from "./routes/ReviewRoute.js";
import WisataRoute from "./routes/WisataRoute.js";
import HotelRoute from "./routes/HotelRoute.js";
import ReviewHotelRoute from "./routes/ReviewHotelRoute.js";
import GalleryRoute from "./routes/GalleryRoute.js";
import db from "./config/Database.js";
import { v2 as cloudinary } from "cloudinary";
import HotelModel from "./models/HotelModel.js";
import HotelBobotModel from "./models/HotelBobotModel.js";

dotenv.config();
const app = express();

// Konfigurasi CORS yang lebih lengkap
const corsOptions = {
  origin: 'http://localhost:7007', // Sesuaikan dengan port frontend Anda
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Gunakan konfigurasi CORS
app.use(cors(corsOptions));

// Middleware untuk set header secara manual
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(express.json());
app.use(fileUpload());
app.use(express.static("public"));
app.use(AdminRoute);
app.use(ReviewRoute);
app.use(ReviewHotelRoute);
app.use(WisataRoute);
app.use(HotelRoute);
app.use(GalleryRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server berjalan di port ${PORT}`);
});

export default app;
