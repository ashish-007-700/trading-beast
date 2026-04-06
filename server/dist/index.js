import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import yahooRouter from './routes/yahoo.js';
import binanceRouter from './routes/binance.js';
import finnhubRouter from './routes/finnhub.js';
import truedataRouter from './routes/truedata.js';
import binanceTestnetRouter from './routes/paper-trading/binance-testnet.js';
import ibkrRouter from './routes/paper-trading/ibkr.js';
import journalRouter from './routes/journal.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load from project root
dotenv.config({ path: path.join(__dirname, '../../.env.local') });
const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json());
// API Routes
app.use('/api/yahoo', yahooRouter);
app.use('/api/binance', binanceRouter);
app.use('/api/finnhub', finnhubRouter);
app.use('/api/truedata', truedataRouter);
app.use('/api/journal', journalRouter);
// Paper Trading Routes
app.use('/api/paper-trading/binance', binanceTestnetRouter);
app.use('/api/paper-trading/ibkr', ibkrRouter);
// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// MongoDB connection (optional - for future features)
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('✅ MongoDB connected'))
        .catch((err) => console.error('MongoDB connection error:', err));
}
else {
    console.log('ℹ️  No MONGODB_URI set - running without database');
}
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
