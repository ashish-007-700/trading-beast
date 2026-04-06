import mongoose, { Schema, Document } from 'mongoose';

export interface IJournalEntry extends Document {
  tradeName: string;
  playbookName?: string;
  pair: string;
  direction: 'LONG' | 'SHORT';
  exchange: string;
  entryPrice: number;
  stopPrice?: number;
  targetPrice?: number;
  positionSize: number;
  riskPercentage?: number;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  pnl?: number;
  pnlPercentage?: number;
  entryRules?: string;
  exitRules?: string;
  entryTime: Date;
  exitTime?: Date;
  notes?: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JournalEntrySchema: Schema = new Schema(
  {
    tradeName: {
      type: String,
      required: true,
      trim: true,
    },
    playbookName: {
      type: String,
      trim: true,
    },
    pair: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    direction: {
      type: String,
      enum: ['LONG', 'SHORT'],
      required: true,
    },
    exchange: {
      type: String,
      required: true,
      trim: true,
    },
    entryPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    stopPrice: {
      type: Number,
      min: 0,
    },
    targetPrice: {
      type: Number,
      min: 0,
    },
    positionSize: {
      type: Number,
      required: true,
      min: 0,
    },
    riskPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED', 'CANCELLED'],
      default: 'OPEN',
    },
    pnl: {
      type: Number,
      default: 0,
    },
    pnlPercentage: {
      type: Number,
      default: 0,
    },
    entryRules: {
      type: String,
    },
    exitRules: {
      type: String,
    },
    entryTime: {
      type: Date,
      default: Date.now,
    },
    exitTime: {
      type: Date,
    },
    notes: {
      type: String,
    },
    userId: {
      type: String,
      default: 'default-user',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
JournalEntrySchema.index({ userId: 1, createdAt: -1 });
JournalEntrySchema.index({ status: 1 });
JournalEntrySchema.index({ pair: 1 });

export default mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema);
