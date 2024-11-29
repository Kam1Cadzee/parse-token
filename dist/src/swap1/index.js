"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const RaydiumSwap_1 = __importDefault(require("./RaydiumSwap"));
const swapConfig_1 = require("./swapConfig"); // Import the configuration
/**
 * Performs a token swap on the Raydium protocol.
 * Depending on the configuration, it can execute the swap or simulate it.
 */
const swap = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('swap');
    /**
     * The RaydiumSwap instance for handling swaps.
     */
    const raydiumSwap = new RaydiumSwap_1.default('https://rpc.ankr.com/solana_devnet');
    console.log(`Raydium swap initialized`);
    console.log(`Swapping ${swapConfig_1.swapConfig.tokenAAmount} of ${swapConfig_1.swapConfig.tokenAAddress} for ${swapConfig_1.swapConfig.tokenBAddress}...`);
    /**
     * Load pool keys from the Raydium API to enable finding pool information.
     */
    yield raydiumSwap.loadPoolKeys(swapConfig_1.swapConfig.liquidityFile);
    console.log(`Loaded pool keys`);
    /**
     * Find pool information for the given token pair.
     */
    const poolInfo = raydiumSwap.findPoolInfoForTokens(swapConfig_1.swapConfig.tokenAAddress, swapConfig_1.swapConfig.tokenBAddress);
    if (!poolInfo) {
        console.error('Pool info not found');
        return 'Pool info not found';
    }
    else {
        console.log('Found pool info');
    }
    /**
     * Prepare the swap transaction with the given parameters.
     */
    let tx;
    try {
        tx = yield raydiumSwap.getSwapTransaction(swapConfig_1.swapConfig.tokenBAddress, swapConfig_1.swapConfig.tokenAAmount, poolInfo, swapConfig_1.swapConfig.maxLamports, swapConfig_1.swapConfig.useVersionedTransaction, swapConfig_1.swapConfig.direction);
        console.log(tx);
    }
    catch (e) {
        console.log(e);
    }
    /**
     * Depending on the configuration, execute or simulate the swap.
     */
    if (swapConfig_1.swapConfig.executeSwap) {
        /**
         * Send the transaction to the network and log the transaction ID.
         */
        const txid = swapConfig_1.swapConfig.useVersionedTransaction
            ? yield raydiumSwap.sendVersionedTransaction(tx, swapConfig_1.swapConfig.maxRetries)
            : yield raydiumSwap.sendLegacyTransaction(tx, swapConfig_1.swapConfig.maxRetries);
        console.log(`https://solscan.io/tx/${txid}`);
    }
    else {
        /**
         * Simulate the transaction and log the result.
         */
        try {
            const simRes = swapConfig_1.swapConfig.useVersionedTransaction
                ? yield raydiumSwap.simulateVersionedTransaction(tx)
                : yield raydiumSwap.simulateLegacyTransaction(tx);
            console.log(simRes);
        }
        catch (e) {
            console.log(e);
        }
    }
});
exports.default = swap;
//# sourceMappingURL=index.js.map