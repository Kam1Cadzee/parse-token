"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swapConfig = void 0;
exports.swapConfig = {
    executeSwap: false, // Send tx when true, simulate tx when false
    useVersionedTransaction: true,
    tokenAAmount: 0.01, // Swap 0.01 SOL for USDT in this example
    tokenAAddress: "So11111111111111111111111111111111111111112", // Token to swap for the other, SOL in this case
    tokenBAddress: "Hp4XeAZ5EhKnFGm8Yv5GhZYmspNXGWV8SoRXPz91ZUab", // USDC address
    maxLamports: 1500000, // Micro lamports for priority fee
    direction: "in", // Swap direction: 'in' or 'out'
    liquidityFile: "https://api.raydium.io/v2/sdk/liquidity/mainnet.json",
    maxRetries: 20,
};
//# sourceMappingURL=swapConfig.js.map