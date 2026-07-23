import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    passwordHash: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    preferences: {
        alertsEnabled: boolean;
        emailNotifications: boolean;
        tradingSessionAlerts: {
            tokyo: boolean;
            london: boolean;
            newYork: boolean;
            sydney: boolean;
        };
    };
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map