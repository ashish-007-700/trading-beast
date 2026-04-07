import mongoose, { Schema } from 'mongoose';
const HoldingSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    ticker: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
    },
    assetType: {
        type: String,
        enum: ['Stock', 'ETF', 'Crypto', 'Bond', 'Mutual Fund'],
        default: 'Stock',
    },
    shares: {
        type: Number,
        required: true,
        min: 0,
    },
    buyDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    buyPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    currentPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: ['Holding', 'Sold'],
        default: 'Holding',
    },
    notes: {
        type: String,
    },
    userId: {
        type: String,
        default: 'default-user',
    },
}, {
    timestamps: true,
});
// Index for faster queries
HoldingSchema.index({ userId: 1, createdAt: -1 });
HoldingSchema.index({ status: 1 });
HoldingSchema.index({ ticker: 1 });
export default mongoose.model('Holding', HoldingSchema);
