import { Request, Response } from 'express';
import Deal from '../models/Deal';

export const getDeals = async (req: Request, res: Response): Promise<void> => {
  try {
    const deals = await Deal.find().populate('company contact owner');
    res.json(deals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
};

export const getDeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const deal = await Deal.findById(req.params.id).populate('company contact owner');
    if (!deal) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }
    res.json(deal);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deal' });
  }
};

export const createDeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const deal = new Deal(req.body);
    await deal.save();
    res.status(201).json(deal);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create deal' });
  }
};

export const updateDeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!deal) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }
    res.json(deal);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update deal' });
  }
};

export const deleteDeal = async (req: Request, res: Response): Promise<void> => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    if (!deal) {
      res.status(404).json({ error: 'Deal not found' });
      return;
    }
    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete deal' });
  }
};
