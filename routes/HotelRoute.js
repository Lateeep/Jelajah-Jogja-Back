import express from 'express';
import {
  getAllHotel,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  getHotelRecommendations,
  updateAllHotelBobot, // Tambahkan import
  getBobot // Tambahkan import
} from '../controllers/HotelController.js';

const router = express.Router();

// Route yang sudah ada
router.post('/hotel-recommendations', getHotelRecommendations);
router.get('/hotel', getAllHotel);
router.get('/hotel/:id', getHotelById);
router.post('/hotel', createHotel);
router.patch('/hotel/:id', updateHotel);
router.delete('/hotel/:id', deleteHotel);

// Tambahkan route untuk bobot
router.get('/hotel-bobot', getBobot); // Endpoint untuk mengambil bobot
router.post('/hotel-bobot/update-all', updateAllHotelBobot); // Endpoint untuk update bobot

export default router;