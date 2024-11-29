import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { LiquidityPoolKeys, LiquidityPoolJsonInfo, TokenAccount, TokenAmount, Percent } from '@raydium-io/raydium-sdk';
/**
 * Class representing a Raydium Swap operation.
 */
declare class RaydiumSwap {
    allPoolKeysJson: LiquidityPoolJsonInfo[];
    connection: Connection;
    /**
   * Create a RaydiumSwap instance.
   * @param {string} RPC_URL - The RPC URL for connecting to the Solana blockchain.
   * @param {string} WALLET_PRIVATE_KEY - The private key of the wallet in base58 format.
   */
    constructor(RPC_URL: string);
    /**
    * Loads all the pool keys available from a JSON configuration file.
    * @async
    * @returns {Promise<void>}
    */
    loadPoolKeys(liquidityFile: string): Promise<void>;
    /**
   * Finds pool information for the given token pair.
   * @param {string} mintA - The mint address of the first token.
   * @param {string} mintB - The mint address of the second token.
   * @returns {LiquidityPoolKeys | null} The liquidity pool keys if found, otherwise null.
   */
    findPoolInfoForTokens(mintA: string, mintB: string): import("@raydium-io/raydium-sdk").LiquidityPoolKeysV4;
    /**
   * Retrieves token accounts owned by the wallet.
   * @async
   * @returns {Promise<TokenAccount[]>} An array of token accounts.
   */
    getOwnerTokenAccounts(): Promise<{
        pubkey: PublicKey;
        programId: PublicKey;
        accountInfo: {
            mint: PublicKey;
            delegate: PublicKey;
            owner: PublicKey;
            state: number;
            amount: any;
            delegateOption: number;
            isNativeOption: number;
            isNative: any;
            delegatedAmount: any;
            closeAuthorityOption: number;
            closeAuthority: PublicKey;
        };
    }[]>;
    /**
   * Builds a swap transaction.
   * @async
   * @param {string} toToken - The mint address of the token to receive.
   * @param {number} amount - The amount of the token to swap.
   * @param {LiquidityPoolKeys} poolKeys - The liquidity pool keys.
   * @param {number} [maxLamports=100000] - The maximum lamports to use for transaction fees.
   * @param {boolean} [useVersionedTransaction=true] - Whether to use a versioned transaction.
   * @param {'in' | 'out'} [fixedSide='in'] - The fixed side of the swap ('in' or 'out').
   * @returns {Promise<Transaction | VersionedTransaction>} The constructed swap transaction.
   */
    getSwapTransaction(toToken: string, amount: number, poolKeys: LiquidityPoolKeys, maxLamports?: number, useVersionedTransaction?: boolean, fixedSide?: 'in' | 'out'): Promise<Transaction | VersionedTransaction>;
    /**
   * Sends a legacy transaction.
   * @async
   * @param {Transaction} tx - The transaction to send.
   * @returns {Promise<string>} The transaction ID.
   */
    sendLegacyTransaction(tx: Transaction, maxRetries?: number): Promise<string>;
    /**
   * Sends a versioned transaction.
   * @async
   * @param {VersionedTransaction} tx - The versioned transaction to send.
   * @returns {Promise<string>} The transaction ID.
   */
    sendVersionedTransaction(tx: VersionedTransaction, maxRetries?: number): Promise<string>;
    /**
      * Simulates a versioned transaction.
      * @async
      * @param {VersionedTransaction} tx - The versioned transaction to simulate.
      * @returns {Promise<any>} The simulation result.
      */
    simulateLegacyTransaction(tx: Transaction): Promise<import("@solana/web3.js").RpcResponseAndContext<import("@solana/web3.js").SimulatedTransactionResponse>>;
    /**
   * Simulates a versioned transaction.
   * @async
   * @param {VersionedTransaction} tx - The versioned transaction to simulate.
   * @returns {Promise<any>} The simulation result.
   */
    simulateVersionedTransaction(tx: VersionedTransaction): Promise<import("@solana/web3.js").RpcResponseAndContext<import("@solana/web3.js").SimulatedTransactionResponse>>;
    /**
   * Gets a token account by owner and mint address.
   * @param {PublicKey} mint - The mint address of the token.
   * @returns {TokenAccount} The token account.
   */
    getTokenAccountByOwnerAndMint(mint: PublicKey): TokenAccount;
    /**
   * Calculates the amount out for a swap.
   * @async
   * @param {LiquidityPoolKeys} poolKeys - The liquidity pool keys.
   * @param {number} rawAmountIn - The raw amount of the input token.
   * @param {boolean} swapInDirection - The direction of the swap (true for in, false for out).
   * @returns {Promise<Object>} The swap calculation result.
   */
    calcAmountOut(poolKeys: LiquidityPoolKeys, rawAmountIn: number, swapInDirection: boolean): Promise<{
        amountIn: TokenAmount;
        amountOut: import("@raydium-io/raydium-sdk").CurrencyAmount | TokenAmount;
        minAmountOut: import("@raydium-io/raydium-sdk").CurrencyAmount | TokenAmount;
        currentPrice: import("@raydium-io/raydium-sdk").Price;
        executionPrice: import("@raydium-io/raydium-sdk").Price;
        priceImpact: Percent;
        fee: import("@raydium-io/raydium-sdk").CurrencyAmount;
    }>;
}
export default RaydiumSwap;
