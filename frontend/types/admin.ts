// Test Types - shared across all admin pages
export type TestType = 'IELTS' | 'PTE' | 'GRE' | 'TOEFL' | 'SAT' | 'Duolingo' | 'GMAT' | 'OET' | 'Cambridge';

// Course Interface
export interface Course {
  _id: string;
  name: string;
  testType: TestType;
  description: string;
  durationMonths: number;
  enrolledCount: number;
  capacity: number;
  startDate: string;
  price: number;
  currency: string;
  instructor: string;
  schedule: string;
  syllabus: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock Test Package Interface
export interface MockTestPricing {
  testCount: number;
  fee: number;
}

export interface MockTestPackage {
  _id: string;
  testType: TestType;
  features: string[];
  pricing: MockTestPricing[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Mock Test Schedule Interface
export interface MockTestSchedule {
  _id: string;
  listNumber: number;
  name: string;
  testType: TestType;
  examDate: string;
  examTime: string;
  totalSeats: number;
  availableSeats: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// Exam Interface
export type ExamType = 'Computer-Based' | 'Paper-Based' | 'Online';

export interface Exam {
  _id: string;
  name: string;
  examType: ExamType;
  testType: TestType;
  examDate: string;
  examTime: string;
  venue: string;
  registrationDeadline: string;
  fee: number;
  currency: string;
  totalSlots: number;
  availableSlots: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Filter State Interface
export interface FilterState {
  courseType?: string;
  testType?: TestType | 'all';
  examType?: ExamType | 'all';
  status?: string;
  sortBy?: string;
  dateRange?: { start: string; end: string };
}

// Badge color mappings
export const testTypeBadgeColors: Record<TestType, string> = {
  'IELTS': 'bg-red-100 text-red-700 border-red-200',
  'PTE': 'bg-purple-100 text-purple-700 border-purple-200',
  'GRE': 'bg-green-100 text-green-700 border-green-200',
  'TOEFL': 'bg-blue-100 text-blue-700 border-blue-200',
  'SAT': 'bg-orange-100 text-orange-700 border-orange-200',
  'Duolingo': 'bg-lime-100 text-lime-700 border-lime-200',
  'GMAT': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'OET': 'bg-pink-100 text-pink-700 border-pink-200',
  'Cambridge': 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

export const examTypeBadgeColors: Record<ExamType, string> = {
  'Computer-Based': 'bg-blue-100 text-blue-700',
  'Paper-Based': 'bg-amber-100 text-amber-700',
  'Online': 'bg-teal-100 text-teal-700',
};

export const statusBadgeColors: Record<string, string> = {
  'active': 'bg-green-100 text-green-700',
  'inactive': 'bg-gray-100 text-gray-600',
  'upcoming': 'bg-blue-100 text-blue-700',
  'ongoing': 'bg-yellow-100 text-yellow-700',
  'completed': 'bg-green-100 text-green-700',
  'cancelled': 'bg-red-100 text-red-700',
  'open': 'bg-green-100 text-green-700',
  'closed': 'bg-gray-100 text-gray-600',
};
