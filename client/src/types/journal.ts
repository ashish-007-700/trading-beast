export interface JournalEntry {
  _id: string;
  tradeName: string;
  playbookName?: string;
  pair: string;
  direction: "LONG" | "SHORT";
  exchange: string;
  entryPrice: number;
  stopPrice?: number;
  targetPrice?: number;
  positionSize: number;
  riskPercentage?: number;
  status: "OPEN" | "CLOSED" | "CANCELLED";
  pnl: number;
  pnlPercentage: number;
  entryRules?: string;
  exitRules?: string;
  notes?: string;
  entryTime: string;
  exitTime?: string;
  createdAt: string;
  updatedAt: string;
}

export type JournalFormData = Omit<JournalEntry, "_id" | "createdAt" | "updatedAt">;

export interface JournalStats {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  avgPnL: number;
  avgWin: number;
  avgLoss: number;
}
