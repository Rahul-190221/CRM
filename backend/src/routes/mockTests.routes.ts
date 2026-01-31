import express from 'express';
import {
  getMockTestPackages,
  getMockTestPackage,
  createMockTestPackage,
  updateMockTestPackage,
  deleteMockTestPackage,
  getMockTestSchedules,
  getMockTestSchedule,
  createMockTestSchedule,
  updateMockTestSchedule,
  deleteMockTestSchedule,
} from '../controllers/mockTests.controller';

const router = express.Router();

// Mock Test Packages
router.get('/packages', getMockTestPackages);
router.get('/packages/:id', getMockTestPackage);
router.post('/packages', createMockTestPackage);
router.patch('/packages/:id', updateMockTestPackage);
router.delete('/packages/:id', deleteMockTestPackage);

// Mock Test Schedules
router.get('/schedules', getMockTestSchedules);
router.get('/schedules/:id', getMockTestSchedule);
router.post('/schedules', createMockTestSchedule);
router.patch('/schedules/:id', updateMockTestSchedule);
router.delete('/schedules/:id', deleteMockTestSchedule);

export default router;
