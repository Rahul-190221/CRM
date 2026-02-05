import { Router } from 'express';
import {
  getAllPackages,
  getPackageByTestType,
  createPackage,
  updatePackage,
  deletePackage,
  seedPackages
} from '../controllers/mockTestPackages.controller';

const router = Router();

// GET /api/mock-test-packages - Get all packages
router.get('/', getAllPackages);

// POST /api/mock-test-packages/seed - Seed initial packages
router.post('/seed', seedPackages);

// GET /api/mock-test-packages/:testType - Get package by test type
router.get('/:testType', getPackageByTestType);

// POST /api/mock-test-packages - Create new package
router.post('/', createPackage);

// PUT /api/mock-test-packages/:testType - Update package
router.put('/:testType', updatePackage);

// DELETE /api/mock-test-packages/:testType - Delete package
router.delete('/:testType', deletePackage);

export default router;
