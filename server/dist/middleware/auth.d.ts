import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User';
export interface AuthRequest extends Request {
    user?: IUser;
    userId?: string;
}
interface JwtPayload {
    userId: string;
    email: string;
    iat: number;
    exp: number;
}
export declare const generateAccessToken: (user: IUser) => string;
export declare const generateRefreshToken: (user: IUser) => string;
export declare const verifyToken: (token: string) => JwtPayload;
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuthMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=auth.d.ts.map