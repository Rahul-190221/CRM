import { Request, Response } from 'express';
import Company from '../models/Company';

export const getCompanies = async (req: Request, res: Response): Promise<void> => {
  try {
    const companies = await Company.find().populate('owner');
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
};

export const getCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const company = await Company.findById(req.params.id).populate('owner');
    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company' });
  }
};

export const createCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const company = new Company(req.body);
    await company.save();
    res.status(201).json(company);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create company' });
  }
};

export const updateCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    res.json(company);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update company' });
  }
};

export const deleteCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete company' });
  }
};
