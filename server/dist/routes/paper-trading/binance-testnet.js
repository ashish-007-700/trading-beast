import { Router } from "express";
import crypto from "crypto";
const router = Router();
// Binance Testnet API base URL
const BINANCE_TESTNET_API = "https://testnet.binance.vision/api/v3";
// Helper to create signature for authenticated requests
function createSignature(queryString, secret) {
    return crypto.createHmac("sha256", secret).update(queryString).digest("hex");
}
// Helper for authenticated requests
async function authenticatedRequest(endpoint, method, params = {}, apiKey, apiSecret) {
    const key = apiKey || process.env.BINANCE_TESTNET_API_KEY;
    const secret = apiSecret || process.env.BINANCE_TESTNET_SECRET;
    if (!key || !secret) {
        throw new Error("Binance Testnet API credentials not configured");
    }
    // Add timestamp
    params.timestamp = Date.now().toString();
    params.recvWindow = "60000";
    // Create query string and signature
    const queryString = new URLSearchParams(params).toString();
    const signature = createSignature(queryString, secret);
    const url = `${BINANCE_TESTNET_API}${endpoint}?${queryString}&signature=${signature}`;
    const response = await fetch(url, {
        method,
        headers: {
            "X-MBX-APIKEY": key,
        },
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.msg || `Binance API error: ${response.status}`);
    }
    return data;
}
/**
 * GET /account - Get account information and balances
 */
router.get("/account", async (req, res) => {
    try {
        const data = await authenticatedRequest("/account", "GET");
        // Filter to show only non-zero balances
        const balances = data.balances.filter((b) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0);
        res.json({
            makerCommission: data.makerCommission,
            takerCommission: data.takerCommission,
            canTrade: data.canTrade,
            canWithdraw: data.canWithdraw,
            canDeposit: data.canDeposit,
            balances,
        });
    }
    catch (err) {
        console.error("[Binance Testnet] Account error:", err.message);
        res.status(500).json({ error: err.message });
    }
});
/**
 * GET /orders - Get open orders
 */
router.get("/orders", async (req, res) => {
    try {
        const symbol = req.query.symbol;
        const params = {};
        if (symbol) {
            params.symbol = symbol;
        }
        const data = await authenticatedRequest("/openOrders", "GET", params);
        res.json({
            orders: data,
        });
    }
    catch (err) {
        console.error("[Binance Testnet] Orders error:", err.message);
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
        const params = {
            symbol: symbol.toUpperCase(),
            side: side.toUpperCase(),
            type: type.toUpperCase(),
            quantity: String(quantity),
        };
        // Add price for limit orders
        if (type.toUpperCase() === "LIMIT") {
            if (!price) {
                res.status(400).json({ error: "Price required for limit orders" });
                return;
            }
            params.price = String(price);
            params.timeInForce = "GTC";
        }
        const data = await authenticatedRequest("/order", "POST", params);
        res.json({
            success: true,
            order: data,
        });
    }
    catch (err) {
        console.error("[Binance Testnet] Order error:", err.message);
        res.status(500).json({ error: err.message });
    }
});
/**
 * DELETE /order - Cancel an order
 */
router.delete("/order", async (req, res) => {
    try {
        const symbol = req.query.symbol;
        const orderId = req.query.orderId;
        if (!symbol || !orderId) {
            res.status(400).json({ error: "Missing symbol or orderId" });
            return;
        }
        const data = await authenticatedRequest("/order", "DELETE", {
            symbol: symbol.toUpperCase(),
            orderId,
        });
        res.json({
            success: true,
            order: data,
        });
    }
    catch (err) {
        console.error("[Binance Testnet] Cancel error:", err.message);
        res.status(500).json({ error: err.message });
    }
});
/**
 * GET /history - Get order history
 */
router.get("/history", async (req, res) => {
    try {
        const symbol = req.query.symbol;
        if (!symbol) {
            res.status(400).json({ error: "Symbol required" });
            return;
        }
        const data = await authenticatedRequest("/allOrders", "GET", {
            symbol: symbol.toUpperCase(),
            limit: "50",
        });
        res.json({
            orders: data,
        });
    }
    catch (err) {
        console.error("[Binance Testnet] History error:", err.message);
        res.status(500).json({ error: err.message });
    }
});
/**
 * GET /trades - Get recent trades
 */
router.get("/trades", async (req, res) => {
    try {
        const symbol = req.query.symbol;
        if (!symbol) {
            res.status(400).json({ error: "Symbol required" });
            return;
        }
        const data = await authenticatedRequest("/myTrades", "GET", {
            symbol: symbol.toUpperCase(),
            limit: "50",
        });
        res.json({
            trades: data,
        });
    }
    catch (err) {
        console.error("[Binance Testnet] Trades error:", err.message);
        res.status(500).json({ error: err.message });
    }
});
export default router;
