import mongoose, { Schema } from 'mongoose';
const JournalEntrySchema = new Schema({
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
    tradeActions: [{
            step: {
                type: Number,
                required: true,
            },
            actionType: {
                type: String,
                required: true,
            },
            asset: {
                type: String,
                required: true,
            },
            strategy: {
                type: String,
            },
            direction: {
                type: String,
                enum: ['Buy', 'Sell'],
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            time: {
                type: Date,
                required: true,
            },
            notes: {
                type: String,
            },
        }],
    userId: {
        type: String,
        default: 'default-user',
    },
}, {
    timestamps: true,
});
// Index for faster queries
JournalEntrySchema.index({ userId: 1, createdAt: -1 });
JournalEntrySchema.index({ status: 1 });
JournalEntrySchema.index({ pair: 1 });
export default mongoose.model('JournalEntry', JournalEntrySchema);
