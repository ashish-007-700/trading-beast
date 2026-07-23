import { IUser } from '../models/User';
import { IAlert } from '../models/Alert';
export declare const TRADING_SESSIONS: {
    tokyo: {
        name: string;
        openIST: string;
        closeIST: string;
    };
    sydney: {
        name: string;
        openIST: string;
        closeIST: string;
    };
    london: {
        name: string;
        openIST: string;
        closeIST: string;
    };
    newYork: {
        name: string;
        openIST: string;
        closeIST: string;
    };
};
export declare const initEmailService: () => void;
export declare const isEmailServiceEnabled: () => boolean;
export declare const sendAlertTriggeredEmail: (user: IUser, alert: IAlert, currentPrice: number) => Promise<boolean>;
export declare const sendSessionNotificationEmail: (user: IUser, session: keyof typeof TRADING_SESSIONS, isOpening: boolean) => Promise<boolean>;
//# sourceMappingURL=emailService.d.ts.map