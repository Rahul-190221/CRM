import express from 'express';
import { getDeals, getDeal, createDeal, updateDeal, deleteDeal } from '../controllers/deals.controller';

const router = express.Router();

router.get('/', getDeals);
router.get('/:id', getDeal);
router.post('/', createDeal);
router.patch('/:id', updateDeal);
router.delete('/:id', deleteDeal);

export default router;
