import mongoose, { Schema, Document } from 'mongoose';

export interface IContact extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  company: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  lifecycleStage: 'Intake' | 'Processing' | 'Hot' | 'Converted' | 'Dead';
  source: 'Website' | 'Referral' | 'Social Media' | 'Email Campaign' | 'Walk-in';
  service?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String },
    jobTitle: { type: String },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lifecycleStage: {
      type: String,
      enum: ['Intake', 'Processing', 'Hot', 'Converted', 'Dead'],
      default: 'Intake',
    },
    source: {
      type: String,
      enum: ['Website', 'Referral', 'Social Media', 'Email Campaign', 'Walk-in'],
      default: 'Website',
    },
    service: { type: String },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<IContact>('Contact', ContactSchema);
