import mongoose, { Schema, Document } from 'mongoose';

export interface IDeal extends Document {
  title: string;
  company: mongoose.Types.ObjectId;
  contact?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  stage: string;
  owner: mongoose.Types.ObjectId;
  closeDate?: Date;
  probability: number;
  createdAt: Date;
  updatedAt: Date;
}

const DealSchema = new Schema<IDeal>(
  {
    title: { type: String, required: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    contact: { type: Schema.Types.ObjectId, ref: 'Contact' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    stage: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    closeDate: { type: Date },
    probability: { type: Number, min: 0, max: 100, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IDeal>('Deal', DealSchema);
