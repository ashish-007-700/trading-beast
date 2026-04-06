import { Router } from "express";
const router = Router();
// IBKR Client Portal API base URL (runs locally with TWS/Gateway)
// Default port is 5000 for Gateway, can be configured
const IBKR_API_BASE = process.env.IBKR_API_URL || "https://localhost:5000/v1/api";
// Helper for IBKR API requests
async function ibkrRequest(endpoint, method = "GET", body) {
    const url = `${IBKR_API_BASE}${endpoint}`;
    const options = {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        // IBKR uses self-signed certs locally
        // @ts-ignore - Node fetch option
        rejectUnauthorized: false,
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    // Note: In production, you'd need to handle SSL certificate verification
    // For local development with TWS/Gateway, we accept self-signed certs
    const response = await fetch(url, options);
    if (!response.ok) {
        const text = await response.text();
        throw new Error(`IBKR API error (${response.status}): ${text}`);
    }
    return response.json();
}
/**
 * GET /account - Get account information
 */
router.get("/account", async (req, res) => {
    try {
        // Get account IDs first
        const accounts = await ibkrRequest("/portfolio/accounts");
        if (!accounts || accounts.length === 0) {
            throw new Error("No accounts found. Ensure TWS/Gateway is running and authenticated.");
        }
        const accountId = accounts[0].accountId;
        // Get account summary
        const summary = await ibkrRequest(`/portfolio/${accountId}/summary`);
        res.json({
            account: {
                accountId,
                accountType: accounts[0].accountType || "Paper",
                currency: summary.currency?.value || "USD",
                availableFunds: summary.availablefunds?.amount || 0,
                buyingPower: summary.buyingpower?.amount || 0,
                netLiquidation: summary.netliquidation?.amount || 0,
            },
        });
    }
    catch (err) {
        console.error("[IBKR] Account error:", err.message);
        res.status(500).json({
            error: err.message,
            hint: "Ensure TWS or IB Gateway is running with API enabled"
        });
    }
});
/**
 * GET /positions - Get current positions
 */
router.get("/positions", async (req, res) => {
    try {
        const accounts = await ibkrRequest("/portfolio/accounts");
        if (!accounts || accounts.length === 0) {
            throw new Error("No accounts found");
        }
        const accountId = accounts[0].accountId;
        const positions = await ibkrRequest(`/portfolio/${accountId}/positions/0`);
        res.json({
            positions: (positions || []).map((p) => ({
                conid: p.conid,
                symbol: p.contractDesc || p.ticker,
                description: p.name,
                position: p.position,
                marketPrice: p.mktPrice,
                marketValue: p.mktValue,
                avgCost: p.avgCost,
                unrealizedPnl: p.unrealizedPnl,
                realizedPnl: p.realizedPnl,
            })),
        });
    }
    catch (err) {
        console.error("[IBKR] Positions error:", err.message);
        res.status(500).json({ error: err.message });
    }
});
/**
 * GET /orders - Get open orders
 */
router.get("/orders", async (req, res) => {
    try {
        const orders = await ibkrRequest("/iserver/account/orders");
        res.json({
            orders: (orders.orders || []).map((o) => ({
                orderId: o.orderId,
                conid: o.conid,
                symbol: o.ticker,
                side: o.side,
                orderType: o.orderType,
                price: o.price,
                quantity: o.totalSize,
                filledQty: o.filledQuantity,
                status: o.status,
                lastExecutionTime: o.lastExecutionTime,
            })),
        });
    }
    catch (err) {
        console.error("[IBKR] Orders error:", err.message);
        res.status(500).json({ error: err.message });
    }
});
/**
 * POST /order - Place a new order
 */
router.post("/order", async (req, res) => {
    try {
        const { symbol, side, type, quantity, price } = req.body;
        if (!symbol || !side || !type || !quantity) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }
        // First, search for the contract to get conid
        const searchResult = await ibkrRequest(`/iserver/secdef/search?symbol=${encodeURIComponent(symbol)}&name=true`);
        if (!searchResult || searchResult.length === 0) {
            res.status(404).json({ error: `Symbol ${symbol} not found` });
            return;
        }
        const conid = searchResult[0].conid;
        // Get account ID
        const accounts = await ibkrRequest("/portfolio/accounts");
        const accountId = accounts[0].accountId;
        // Build order request
        const orderRequest = {
            acctId: accountId,
            conid,
            secType: `${conid}:STK`,
            orderType: type.toUpperCase() === "MARKET" ? "MKT" : "LMT",
            side: side.toUpperCase(),
            quantity,
            tif: "DAY",
            ...(type.toUpperCase() === "LIMIT" && { price }),
        };
        // Place order
        const orderResult = await ibkrRequest(`/iserver/account/${accountId}/orders`, "POST", { orders: [orderRequest] });
        // IBKR may return a confirmation message that needs to be replied to
        if (orderResult[0]?.id && orderResult[0]?.message) {
            // Auto-confirm the order
            const confirmResult = await ibkrRequest(`/iserver/reply/${orderResult[0].id}`, "POST", { confirmed: true });
            res.json({ success: true, order: confirmResult });
        }
        else {
            res.json({ success: true, order: orderResult });
        }
    }
    catch (err) {
        console.error("[IBKR] Order error:", err.message);
        res.status(500).json({ error: err.message });
    }
});
/**
 * DELETE /order/:orderId - Cancel an order
 */
router.delete("/order/:orderId", async (req, res) => {
    try {
        const { orderId } = req.params;
        const accounts = await ibkrRequest("/portfolio/accounts");
        const accountId = accounts[0].accountId;
        const result = await ibkrRequest(`/iserver/account/${accountId}/order/${orderId}`, "DELETE");
        res.json({ success: true, result });
    }
    catch (err) {
        console.error("[IBKR] Cancel error:", err.message);
        res.status(500).json({ error: err.message });
    }
});
/**
 * GET /trades - Get recent trades/executions
 */
router.get("/trades", async (req, res) => {
    try {
        const trades = await ibkrRequest("/iserver/account/trades");
        res.json({
            trades: (trades || []).map((t) => ({
                executionId: t.execution_id,
                symbol: t.symbol,
                side: t.side,
                quantity: t.size,
                price: t.price,
                time: t.trade_time,
                commission: t.commission,
            })),
        });
    }
    catch (err) {
        console.error("[IBKR] Trades error:", err.message);
        res.status(500).json({ error: err.message });
    }
});
export default router;
