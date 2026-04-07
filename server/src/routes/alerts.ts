import { Router, Response } from 'express';
import { Alert, AlertCondition } from '../models/Alert';
import { AuthRequest, authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * GET /api/alerts
 * Get all alerts for the current user
 */
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { status, symbol } = req.query;
    
    const filter: any = { userId: req.userId };
    
    if (status && typeof status === 'string') {
      filter.status = status;
    }
    
    if (symbol && typeof symbol === 'string') {
      filter.symbol = symbol.toUpperCase();
    }

    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      alerts,
      count: alerts.length,
    });
  } catch (error: any) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

/**
 * GET /api/alerts/active
 * Get only active alerts for the current user
 */
router.get('/active', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const alerts = await Alert.find({
      userId: req.userId,
      status: 'active',
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      alerts,
      count: alerts.length,
    });
  } catch (error: any) {
    console.error('Get active alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch active alerts' });
  }
});

/**
 * GET /api/alerts/history
 * Get triggered/expired alerts history
 */
router.get('/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 50 } = req.query;

    const alerts = await Alert.find({
      userId: req.userId,
      status: { $in: ['triggered', 'expired', 'cancelled'] },
    })
      .sort({ updatedAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      alerts,
      count: alerts.length,
    });
  } catch (error: any) {
    console.error('Get alert history error:', error);
    res.status(500).json({ error: 'Failed to fetch alert history' });
  }
});

/**
 * GET /api/alerts/:id
 * Get a specific alert
 */
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const alert = await Alert.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    res.json({
      success: true,
      alert,
    });
  } catch (error: any) {
    console.error('Get alert error:', error);
    res.status(500).json({ error: 'Failed to fetch alert' });
  }
});

/**
 * POST /api/alerts
 * Create a new alert
 */
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { symbol, targetPrice, condition, message, expiresAt } = req.body;

    if (!symbol || targetPrice === undefined || !condition) {
      res.status(400).json({ error: 'Symbol, targetPrice, and condition are required' });
      return;
    }

    if (!['above', 'below', 'crosses'].includes(condition)) {
      res.status(400).json({ error: 'Condition must be above, below, or crosses' });
      return;
    }

    const alert = new Alert({
      userId: req.userId,
      symbol: symbol.toUpperCase(),
      targetPrice: Number(targetPrice),
      condition: condition as AlertCondition,
      message,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    await alert.save();

    res.status(201).json({
      success: true,
      alert,
    });
  } catch (error: any) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

/**
 * PUT /api/alerts/:id
 * Update an alert
 */
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { targetPrice, condition, message, expiresAt, status } = req.body;

    const alert = await Alert.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!alert) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    // Only allow updates to active alerts (except status change)
    if (alert.status !== 'active' && !status) {
      res.status(400).json({ error: 'Cannot modify non-active alerts' });
      return;
    }

    if (targetPrice !== undefined) alert.targetPrice = Number(targetPrice);
    if (condition) alert.condition = condition as AlertCondition;
    if (message !== undefined) alert.message = message;
    if (expiresAt) alert.expiresAt = new Date(expiresAt);
    if (status && ['active', 'cancelled'].includes(status)) {
      alert.status = status;
    }

    await alert.save();

    res.json({
      success: true,
      alert,
    });
  } catch (error: any) {
    console.error('Update alert error:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

/**
 * DELETE /api/alerts/:id
 * Delete an alert
 */
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await Alert.deleteOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Alert deleted',
    });
  } catch (error: any) {
    console.error('Delete alert error:', error);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

/**
 * POST /api/alerts/:id/cancel
 * Cancel an active alert
 */
router.post('/:id/cancel', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
        status: 'active',
      },
      { status: 'cancelled' },
      { new: true }
    );

    if (!alert) {
      res.status(404).json({ error: 'Active alert not found' });
      return;
    }

    res.json({
      success: true,
      alert,
    });
  } catch (error: any) {
    console.error('Cancel alert error:', error);
    res.status(500).json({ error: 'Failed to cancel alert' });
  }
});

/**
 * GET /api/alerts/stats
 * Get alert statistics for the user
 */
router.get('/user/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const [active, triggered, total] = await Promise.all([
      Alert.countDocuments({ userId: req.userId, status: 'active' }),
      Alert.countDocuments({ userId: req.userId, status: 'triggered' }),
      Alert.countDocuments({ userId: req.userId }),
    ]);

    res.json({
      success: true,
      stats: {
        active,
        triggered,
        total,
        cancelled: total - active - triggered,
      },
    });
  } catch (error: any) {
    console.error('Get alert stats error:', error);
    res.status(500).json({ error: 'Failed to fetch alert stats' });
  }
});

export default router;
