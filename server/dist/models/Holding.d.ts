import mongoose, { Document } from 'mongoose';
export interface IHolding extends Document {
    name: string;
    ticker: string;
    assetType: 'Stock' | 'ETF' | 'Crypto' | 'Bond' | 'Mutual Fund';
    shares: number;
    buyDate: Date;
    buyPrice: number;
    currentPrice: number;
    status: 'Holding' | 'Sold';
    notes?: string;
    userId?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IHolding, {}, {}, {}, mongoose.Document<unknown, {}, IHolding, {}, {}> & IHolding & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Holding.d.ts.map