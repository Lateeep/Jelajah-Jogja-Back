import express from 'express';
import {
  getAllReview,
  getReviewByWisataId,
  createReview
} from '../controllers/ReviewController.js';

const router = express.Router();

router.get('/getallreview', getAllReview);
router.get('/getreviewbywisataid/:id', getReviewByWisataId);
router.post('/createreview/:id', createReview);

export default router;
