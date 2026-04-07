import { Router } from 'express';
import Holding from '../models/Holding.js';
const router = Router();
// Example seed data for initial demo
const exampleHoldings = [
    {
        name: 'Tesla Inc.',
        ticker: 'TSLA',
        assetType: 'Stock',
        shares: 5,
        buyDate: new Date('2024-02-15'),
        buyPrice: 700.00,
        currentPrice: 720.00,
        status: 'Holding',
        notes: 'Long-term EV play',
    },
    {
        name: 'Apple Inc.',
        ticker: 'AAPL',
        assetType: 'Stock',
        shares: 10,
        buyDate: new Date('2024-01-10'),
        buyPrice: 150.00,
        currentPrice: 175.00,
        status: 'Holding',
        notes: 'Core tech holding',
    },
    {
        name: 'NVIDIA Corporation',
        ticker: 'NVDA',
        assetType: 'Stock',
        shares: 8,
        buyDate: new Date('2024-03-01'),
        buyPrice: 850.00,
        currentPrice: 920.00,
        status: 'Holding',
        notes: 'AI/GPU growth investment',
    },
];
/**
 * GET /api/holdings
 * Get all holdings with optional filters
 */
router.get('/', async (req, res) => {
    try {
        const { status, assetType, ticker } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (assetType)
            filter.assetType = assetType;
        if (ticker)
            filter.ticker = ticker.toUpperCase();
        let holdings = await Holding.find(filter)
            .sort({ createdAt: -1 })
            .lean();
        // Seed example data if empty
        if (holdings.length === 0 && !status && !assetType && !ticker) {
            await Holding.insertMany(exampleHoldings);
            holdings = await Holding.find().sort({ createdAt: -1 }).lean();
        }
        res.json({
            success: true,
            count: holdings.length,
            holdings,
        });
    }
    catch (err) {
        console.error('[Holdings] Get holdings error:', err);
        res.status(500).json({ error: err.message });
    }
});
/**
 * GET /api/holdings/stats
 * Get portfolio statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const holdings = await Holding.find({ status: 'Holding' });
        const totalHoldings = holdings.length;
        let totalInvested = 0;
        let totalCurrentValue = 0;
        let gainingPositions = 0;
        let losingPositions = 0;
        holdings.forEach(h => {
            const invested = h.shares * h.buyPrice;
            const currentValue = h.shares * h.currentPrice;
            totalInvested += invested;
            totalCurrentValue += currentValue;
            if (currentValue >= invested) {
                gainingPositions++;
            }
            else {
                losingPositions++;
            }
        });
        const totalProfitLoss = totalCurrentValue - totalInvested;
        const totalPercentChange = totalInvested > 0
            ? ((totalCurrentValue - totalInvested) / totalInvested) * 100
            : 0;
        res.json({
            success: true,
            stats: {
                totalHoldings,
                totalInvested,
                totalCurrentValue,
                totalProfitLoss,
                totalPercentChange,
                gainingPositions,
                losingPositions,
            },
        });
    }
    catch (err) {
        console.error('[Holdings] Stats error:', err);
        res.status(500).json({ error: err.message });
    }
});
/**
 * GET /api/holdings/:id
 * Get single holding by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const holding = await Holding.findById(req.params.id);
        if (!holding) {
            res.status(404).json({ error: 'Holding not found' });
            return;
        }
        res.json({
            success: true,
            holding,
        });
    }
    catch (err) {
        console.error('[Holdings] Get holding error:', err);
        res.status(500).json({ error: err.message });
    }
});
/**
 * POST /api/holdings
 * Create new holding
 */
router.post('/', async (req, res) => {
    try {
        const holding = new Holding(req.body);
        await holding.save();
        res.status(201).json({
            success: true,
            holding,
        });
    }
    catch (err) {
        console.error('[Holdings] Create holding error:', err);
        res.status(400).json({ error: err.message });
    }
});
/**
 * PUT /api/holdings/:id
 * Update holding
 */
router.put('/:id', async (req, res) => {
    try {
        const holding = await Holding.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!holding) {
            res.status(404).json({ error: 'Holding not found' });
            return;
        }
        res.json({
            success: true,
            holding,
        });
    }
    catch (err) {
        console.error('[Holdings] Update holding error:', err);
        res.status(400).json({ error: err.message });
    }
});
/**
 * DELETE /api/holdings/:id
 * Delete holding
 */
router.delete('/:id', async (req, res) => {
    try {
        const holding = await Holding.findByIdAndDelete(req.params.id);
        if (!holding) {
            res.status(404).json({ error: 'Holding not found' });
            return;
        }
        res.json({
            success: true,
            message: 'Holding deleted',
        });
    }
    catch (err) {
        console.error('[Holdings] Delete holding error:', err);
        res.status(500).json({ error: err.message });
    }
});
export default router;
