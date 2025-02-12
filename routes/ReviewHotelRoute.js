import express from 'express';
import {
  getAllReviewHotel,
  getReviewByWisataId,
  createReview
} from '../controllers/ReviewHotelController.js';

const router = express.Router();

router.get('/getallreviewhotel', getAllReviewHotel);
router.get('/getreviewhotelbywisataid/:id', getReviewByWisataId);
router.post('/createreviewhotel/:id', createReview);

export default router;
