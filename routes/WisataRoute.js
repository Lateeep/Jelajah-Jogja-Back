import express from 'express';
import {
  getWisata,
  getWisataById,
  createWisata,
  updateWisata,
  deleteWisata
} from '../controllers/WisataController.js';

const router = express.Router();

router.get('/getwisata', getWisata);
router.get('/getwisatabyid/:id', getWisataById);
router.post('/createwisata', createWisata);
router.patch('/updatewisata/:id', updateWisata);
router.delete('/deletewisata/:id', deleteWisata);
export default router;