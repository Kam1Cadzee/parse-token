type Token = {
  signature: string;
  mint: string;
  traderPublicKey: string;
  txType: 'create' | 'sell' | 'buy';
  initialBuy: number;
  bondingCurveKey: string;
  vTokensInBondingCurve: number;
  vSolInBondingCurve: number;
  marketCapSol: number;
  name: string;
  symbol: string;
  uri: string;
  tokenAmount: number;
};

export type PayloadToken = {
  created_timestamp: string;
  description: string;
  symbol: string;
  name: string;
  image_uri: string;
  twitter: string;
  telegram: string;
  website: string;
  mint: string;
  url: string;
  mc: number;
  initBuy: number;
  profit: number;
};
export default Token;
