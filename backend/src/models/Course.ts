import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse extends Document {
  name: string;
  testType: string;
  description: string;
  durationMonths: number;
  enrolledCount: number;
  capacity: number;
  startDate: Date;
  price: number;
  currency: string;
  instructor: string;
  schedule: string;
  syllabus: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true },
    testType: {
      type: String,
      enum: ['IELTS', 'PTE', 'GRE', 'TOEFL', 'SAT', 'Duolingo', 'GMAT', 'OET', 'Cambridge'],
      required: true,
    },
    description: { type: String, required: true },
    durationMonths: { type: Number, required: true, min: 1 },
    enrolledCount: { type: Number, default: 0 },
    capacity: { type: Number, default: 50 },
    startDate: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'BDT' },
    instructor: { type: String, default: '' },
    schedule: { type: String, default: '' },
    syllabus: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ICourse>('Course', CourseSchema);
