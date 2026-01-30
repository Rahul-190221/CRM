import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  domain?: string;
  industry?: string;
  size?: number;
  annualRevenue?: number;
  status: 'active' | 'inactive';
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: true,
    },
    domain: {
      type: String,
    },
    industry: {
      type: String,
    },
    size: {
      type: Number,
    },
    annualRevenue: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICompany>('Company', CompanySchema);
