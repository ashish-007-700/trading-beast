import mongoose, { Document, Schema } from 'mongoose';

export type AlertCondition = 'above' | 'below' | 'crosses';
export type AlertStatus = 'active' | 'triggered' | 'expired' | 'cancelled';

export interface IAlertHistory {
  triggeredAt: Date;
  priceAtTrigger: number;
  notificationSent: boolean;
}

export interface IAlert extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  symbol: string;
  targetPrice: number;
  condition: AlertCondition;
  status: AlertStatus;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  triggeredAt?: Date;
  priceAtTrigger?: number;
  notificationSent: boolean;
  history: IAlertHistory[];
}

const alertHistorySchema = new Schema<IAlertHistory>(
  {
    triggeredAt: { type: Date, required: true },
    priceAtTrigger: { type: Number, required: true },
    notificationSent: { type: Boolean, default: false },
  },
  { _id: false }
);

const alertSchema = new Schema<IAlert>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    targetPrice: {
      type: Number,
      required: true,
    },
    condition: {
      type: String,
      enum: ['above', 'below', 'crosses'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'triggered', 'expired', 'cancelled'],
      default: 'active',
      index: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    expiresAt: {
      type: Date,
    },
    triggeredAt: {
      type: Date,
    },
    priceAtTrigger: {
      type: Number,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    history: [alertHistorySchema],
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying of active alerts
alertSchema.index({ status: 1, symbol: 1 });
alertSchema.index({ userId: 1, status: 1 });

export const Alert = mongoose.model<IAlert>('Alert', alertSchema);
