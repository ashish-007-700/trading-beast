import { Router, Request, Response } from 'express';
import JournalEntry from '../models/JournalEntry.js';

const router = Router();

/**
 * GET /api/journal/entries
 * Get all journal entries with optional filters
 */
router.get('/entries', async (req: Request, res: Response) => {
  try {
    const { status, pair, direction, startDate, endDate } = req.query;
    
    const filter: any = {};
    
    if (status) filter.status = status;
    if (pair) filter.pair = (pair as string).toUpperCase();
    if (direction) filter.direction = direction;
    
    if (startDate || endDate) {
      filter.entryTime = {};
      if (startDate) filter.entryTime.$gte = new Date(startDate as string);
      if (endDate) filter.entryTime.$lte = new Date(endDate as string);
    }

    const entries = await JournalEntry.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      count: entries.length,
      entries,
    });
  } catch (err: any) {
    console.error('[Journal] Get entries error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/journal/entries/:id
 * Get single journal entry by ID
 */
router.get('/entries/:id', async (req: Request, res: Response) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);
    
    if (!entry) {
      res.status(404).json({ error: 'Journal entry not found' });
      return;
    }

    res.json({
      success: true,
      entry,
    });
  } catch (err: any) {
    console.error('[Journal] Get entry error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/journal/entries
 * Create new journal entry
 */
router.post('/entries', async (req: Request, res: Response) => {
  try {
    const entry = new JournalEntry(req.body);
    await entry.save();

    res.status(201).json({
      success: true,
      entry,
    });
  } catch (err: any) {
    console.error('[Journal] Create entry error:', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /api/journal/entries/:id
 * Update journal entry
 */
router.put('/entries/:id', async (req: Request, res: Response) => {
  try {
    const entry = await JournalEntry.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!entry) {
      res.status(404).json({ error: 'Journal entry not found' });
      return;
    }

    res.json({
      success: true,
      entry,
    });
  } catch (err: any) {
    console.error('[Journal] Update entry error:', err);
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /api/journal/entries/:id
 * Delete journal entry
 */
router.delete('/entries/:id', async (req: Request, res: Response) => {
  try {
    const entry = await JournalEntry.findByIdAndDelete(req.params.id);

    if (!entry) {
      res.status(404).json({ error: 'Journal entry not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Journal entry deleted',
    });
  } catch (err: any) {
    console.error('[Journal] Delete entry error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/journal/stats
 * Get journal statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const entries = await JournalEntry.find({ status: 'CLOSED' });

    const totalTrades = entries.length;
    const winningTrades = entries.filter(e => (e.pnl || 0) > 0).length;
    const losingTrades = entries.filter(e => (e.pnl || 0) < 0).length;
    const breakEvenTrades = entries.filter(e => (e.pnl || 0) === 0).length;

    const totalPnL = entries.reduce((sum, e) => sum + (e.pnl || 0), 0);
    const avgPnL = totalTrades > 0 ? totalPnL / totalTrades : 0;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    const largestWin = Math.max(...entries.map(e => e.pnl || 0), 0);
    const largestLoss = Math.min(...entries.map(e => e.pnl || 0), 0);

    res.json({
      success: true,
      stats: {
        totalTrades,
        winningTrades,
        losingTrades,
        breakEvenTrades,
        totalPnL,
        avgPnL,
        winRate,
        largestWin,
        largestLoss,
      },
    });
  } catch (err: any) {
    console.error('[Journal] Stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
