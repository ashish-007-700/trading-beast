import mongoose, { Document } from 'mongoose';
export interface TradeAction {
    step: number;
    actionType: string;
    asset: string;
    strategy?: string;
    direction: 'Buy' | 'Sell';
    price: number;
    time: Date;
    notes?: string;
}
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
    tradeActions?: TradeAction[];
    userId?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IJournalEntry, {}, {}, {}, mongoose.Document<unknown, {}, IJournalEntry, {}, {}> & IJournalEntry & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=JournalEntry.d.ts.map