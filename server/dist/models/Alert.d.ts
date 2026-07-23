import mongoose, { Document } from 'mongoose';
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
export declare const Alert: mongoose.Model<IAlert, {}, {}, {}, mongoose.Document<unknown, {}, IAlert, {}, {}> & IAlert & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Alert.d.ts.map