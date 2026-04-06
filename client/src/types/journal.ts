export interface JournalEntry {
  _id: string;
  tradeName: string;
  playbookName?: string;
  pair: string;
  direction: 'LONG' | 'SHORT';
  exchange: string;
  entryPrice: number;
  stopPrice?: number;
  targetPrice?: number;
  positionSize: number;
  riskPercentage?: number;
  status: 'OPEN' | 'CLOSED' | 'CANCELLED';
  pnl?: number;
  pnlPercentage?: number;
  entryRules?: string;
  exitRules?: string;
  entryTime: string;
  exitTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
  totalPnL: number;
  avgPnL: number;
  winRate: number;
  largestWin: number;
  largestLoss: number;
}

export type JournalFormData = Omit<JournalEntry, '_id' | 'createdAt' | 'updatedAt'>;
