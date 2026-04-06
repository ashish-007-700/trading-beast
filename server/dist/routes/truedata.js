import { Router } from 'express';
const router = Router();
// TrueData Historical API endpoint
const TRUEDATA_HISTORY_URL = 'https://history.truedata.in/api/getbars';
// Map client interval to TrueData bar_size format
function mapIntervalToBarSize(interval) {
    const map = {
        '1m': '1 min',
        '5m': '5 mins',
        '15m': '15 mins',
        '30m': '30 mins',
        '60m': '60 mins',
        '1h': '60 mins',
        '1d': 'eod',
        '1wk': 'week',
        '1mo': 'month',
    };
    return map[interval] || '1 min';
}
// Map range to duration format
function mapRangeToDuration(range) {
    const map = {
        '1d': '1 D',
        '5d': '5 D',
        '1mo': '1 M',
        '3mo': '3 M',
        '6mo': '6 M',
        '1y': '1 Y',
        '5y': '5 Y',
    };
    return map[range] || '1 M';
}
// Convert Yahoo-style Indian symbol to TrueData format
// RELIANCE.NS -> RELIANCE
// TCS.BO -> TCS
// ^NSEI -> NIFTY 50 (Nifty Index)
// ^NSEBANK -> NIFTY BANK
// ^BSESN -> SENSEX
function convertSymbol(symbol) {
    const s = symbol.toUpperCase();
    // NSE stocks: RELIANCE.NS -> RELIANCE
    if (s.endsWith('.NS')) {
        return s.replace('.NS', '');
    }
    // BSE stocks: TCS.BO -> TCS
    if (s.endsWith('.BO')) {
        return s.replace('.BO', '');
    }
    // Indian indices mapping
    const indexMap = {
        '^NSEI': 'NIFTY 50',
        '^NSEBANK': 'NIFTY BANK',
        '^BSESN': 'SENSEX',
        '^CNXIT': 'NIFTY IT',
        '^CNXFIN': 'NIFTY FIN SERVICE',
        '^CNXPHARMA': 'NIFTY PHARMA',
        '^CNXAUTO': 'NIFTY AUTO',
        '^CNXMETAL': 'NIFTY METAL',
        '^CNXREALTY': 'NIFTY REALTY',
        '^CNXENERGY': 'NIFTY ENERGY',
        '^CNXINFRA': 'NIFTY INFRA',
        '^CNXPSUBANK': 'NIFTY PSU BANK',
        '^CNXMEDIA': 'NIFTY MEDIA',
    };
    if (indexMap[s]) {
        return indexMap[s];
    }
    // If it starts with ^ but not in our map, try to derive
    if (s.startsWith('^')) {
        return s.substring(1);
    }
    return s;
}
// Check if symbol is an Indian market symbol
export function isIndianSymbol(symbol) {
    const s = symbol.toUpperCase();
    // NSE/BSE stocks
    if (s.endsWith('.NS') || s.endsWith('.BO')) {
        return true;
    }
    // Indian indices
    if (s === '^NSEI' || s === '^NSEBANK' || s === '^BSESN') {
        return true;
    }
    if (s.startsWith('^CNX')) {
        return true;
    }
    // NIFTY/SENSEX direct symbols
    if (s.includes('NIFTY') || s.includes('SENSEX') || s.includes('BANKNIFTY')) {
        return true;
    }
    return false;
}
/**
 * TrueData Historical Candles endpoint
 * Query params:
 *   symbol   – e.g. RELIANCE.NS, TCS.BO, ^NSEI, NIFTY 50
 *   interval – 1m, 5m, 15m, 60m, 1d (default: 1d)
 *   range    – 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y (default: 1mo)
 */
router.get('/candles', async (req, res) => {
    const rawSymbol = req.query.symbol?.trim();
    const interval = req.query.interval?.trim() || '1d';
    const range = req.query.range?.trim() || '1mo';
    if (!rawSymbol) {
        res.status(400).json({ error: 'Missing required query param: symbol' });
        return;
    }
    // Get TrueData credentials from env
    const trueDataKey = process.env.TRUEDATA_API_KEY;
    if (!trueDataKey) {
        res.status(500).json({
            error: 'Missing TRUEDATA_API_KEY. Add it to .env.local (format: userid-password)',
        });
        return;
    }
    // Parse userid and password from key (format: 288721-2e51d517)
    const [userId, password] = trueDataKey.split('-');
    if (!userId || !password) {
        res.status(500).json({
            error: 'Invalid TRUEDATA_API_KEY format. Expected: userid-password',
        });
        return;
    }
    const trueDataSymbol = convertSymbol(rawSymbol);
    const barSize = mapIntervalToBarSize(interval);
    const duration = mapRangeToDuration(range);
    // Calculate from/to dates
    const now = new Date();
    const durationMatch = duration.match(/(\d+)\s*(D|W|M|Y)/i);
    let fromDate = new Date(now);
    if (durationMatch) {
        const num = parseInt(durationMatch[1]);
        const unit = durationMatch[2].toUpperCase();
        switch (unit) {
            case 'D':
                fromDate.setDate(fromDate.getDate() - num);
                break;
            case 'W':
                fromDate.setDate(fromDate.getDate() - num * 7);
                break;
            case 'M':
                fromDate.setMonth(fromDate.getMonth() - num);
                break;
            case 'Y':
                fromDate.setFullYear(fromDate.getFullYear() - num);
                break;
        }
    }
    // Build TrueData API URL with query params
    const url = new URL(TRUEDATA_HISTORY_URL);
    url.searchParams.set('doauth', 'true');
    url.searchParams.set('doformat', 'json');
    url.searchParams.set('symbol', trueDataSymbol);
    url.searchParams.set('barsize', barSize);
    url.searchParams.set('from', fromDate.toISOString().split('T')[0]);
    url.searchParams.set('to', now.toISOString().split('T')[0]);
    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${userId}:${password}`).toString('base64'),
            },
        });
        if (!response.ok) {
            const text = await response.text().catch(() => '');
            res.status(502).json({
                error: `TrueData request failed (${response.status})`,
                details: text || undefined,
            });
            return;
        }
        const data = await response.json();
        if (!data.success || !data.data || data.data.length === 0) {
            res.status(404).json({
                error: data.error || 'No data returned from TrueData',
                symbol: rawSymbol,
                trueDataSymbol,
            });
            return;
        }
        // Convert TrueData format to our standard format
        const points = data.data.map((bar) => ({
            t: Math.floor(new Date(bar.time).getTime() / 1000), // Unix timestamp in seconds
            o: bar.o,
            h: bar.h,
            l: bar.l,
            c: bar.c,
            v: bar.v || 0,
        }));
        res.set('Cache-Control', 'public, max-age=60, s-maxage=60');
        res.json({
            symbol: rawSymbol,
            trueDataSymbol,
            interval,
            range,
            points,
        });
    }
    catch (err) {
        res.status(502).json({
            error: 'TrueData fetch failed',
            details: err.message,
        });
    }
});
/**
 * TrueData quote endpoint for real-time price
 * Query params:
 *   symbol – e.g. RELIANCE.NS, TCS.BO, ^NSEI
 */
router.get('/quote', async (req, res) => {
    const rawSymbol = req.query.symbol?.trim();
    if (!rawSymbol) {
        res.status(400).json({ error: 'Missing required query param: symbol' });
        return;
    }
    const trueDataKey = process.env.TRUEDATA_API_KEY;
    if (!trueDataKey) {
        res.status(500).json({
            error: 'Missing TRUEDATA_API_KEY. Add it to .env.local (format: userid-password)',
        });
        return;
    }
    const [userId, password] = trueDataKey.split('-');
    if (!userId || !password) {
        res.status(500).json({
            error: 'Invalid TRUEDATA_API_KEY format. Expected: userid-password',
        });
        return;
    }
    const trueDataSymbol = convertSymbol(rawSymbol);
    // Use TrueData snapshot API for real-time quote
    const url = new URL('https://history.truedata.in/api/getltp');
    url.searchParams.set('doauth', 'true');
    url.searchParams.set('doformat', 'json');
    url.searchParams.set('symbol', trueDataSymbol);
    try {
        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${userId}:${password}`).toString('base64'),
            },
        });
        if (!response.ok) {
            const text = await response.text().catch(() => '');
            res.status(502).json({
                error: `TrueData quote request failed (${response.status})`,
                details: text || undefined,
            });
            return;
        }
        const data = await response.json();
        res.set('Cache-Control', 'no-store');
        res.json({
            symbol: rawSymbol,
            trueDataSymbol,
            quote: data,
        });
    }
    catch (err) {
        res.status(502).json({
            error: 'TrueData quote fetch failed',
            details: err.message,
        });
    }
});
export default router;
