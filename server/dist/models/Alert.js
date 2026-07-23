import mongoose, { Schema } from 'mongoose';
const alertHistorySchema = new Schema({
    triggeredAt: { type: Date, required: true },
    priceAtTrigger: { type: Number, required: true },
    notificationSent: { type: Boolean, default: false },
}, { _id: false });
const alertSchema = new Schema({
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
}, {
    timestamps: true,
});
// Compound index for efficient querying of active alerts
alertSchema.index({ status: 1, symbol: 1 });
alertSchema.index({ userId: 1, status: 1 });
export const Alert = mongoose.model('Alert', alertSchema);
