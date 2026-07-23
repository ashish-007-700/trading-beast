import jwt from 'jsonwebtoken';
import { User } from '../models/User';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
export const generateAccessToken = (user) => {
    return jwt.sign({ userId: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '24h' });
};
export const generateRefreshToken = (user) => {
    return jwt.sign({ userId: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '7d' });
};
export const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};
export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = verifyToken(token);
            const user = await User.findById(decoded.userId);
            if (!user) {
                res.status(401).json({ error: 'User not found' });
                return;
            }
            req.user = user;
            req.userId = decoded.userId;
            next();
        }
        catch (jwtError) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Authentication error' });
    }
};
// Optional auth - doesn't fail if no token, but attaches user if valid token present
export const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = verifyToken(token);
                const user = await User.findById(decoded.userId);
                if (user) {
                    req.user = user;
                    req.userId = decoded.userId;
                }
            }
            catch {
                // Token invalid, but continue without auth
            }
        }
        next();
    }
    catch {
        next();
    }
};
