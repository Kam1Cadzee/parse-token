import WebSocket from 'ws';
import TimeAgo from 'javascript-time-ago';
// English.
import uk from 'javascript-time-ago/locale/uk';

import { VersionedTransaction, Connection, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import FormData from 'form-data';
import * as fs from 'fs';
import { signature } from '@solana/web3.js/src/layout';
import config from './config';
import { terminal } from 'terminal-kit';
import Token, { PayloadToken } from './types/Token';
import token from './types/Token';
import saveToFile, { saveToFileTop } from './Storage';
import * as console from 'console';
import { exec } from 'child_process';
import parser from './parser/parser';

const owner: Keypair = Keypair.fromSecretKey(bs58.decode(config.private_key));
const ws = new WebSocket('wss://pumpportal.fun/api/data');

const blacklist = [
  'EVPC9UYyWCABcjmK6djuCZzFjXSLt7LgMD7YkgMddwyY',
  'GdaY85VQGt26cZpFoZWTcb1PdqNVx3fZYCrLghC7PMxK',
  'Cuuj5ceRXmWbUbwmQ3ZTFjc6snETyEgVooWuM8GYZUkm',
  '44FUfUxNtGsWRVigDGatXQk9oTc6k72zQ9ohkUktpump',
  '5SLfwydtwBn8y6RCGu4uPjLy7qATmXmpnvpDLgkpp4e8',
  '9JXnu95TG4ZkitJgDasNRHocXXcKiZhQF5A6DMGrbaMe',
  '9pyH9KXfUNHFfWCeS3XuSYF88aaMmWM4VHb6SAjSGEM4',
  '97SXvNokq6MSXkzy6s8SR5E4jG3RN8B97TsPEy8Snt3n',
  'CYhLMDcdFdWDFjfzfW9d3gBdz1bsoNSyJCZR9FvrMTbQ',
  '5UN3bm1ML3TN4povAvHWbFKuH2tnZeYLEmdGn4farUZh',
  '2mJRNYCyX3cZ1bTJpXGnADnc8QzV3S9SkNj96zWSzPx4',
  'G5UJKskioPBg4s2KZ9Cm3rjfV5Y7P6eRSBeE2zzgpmRF',
  'GWdLJQP154o8MKq7zpdp4CAkeL3Dzw2DdeYh7wYZrKb3',
  'B6xKUGYhMy3VH1ArcCS6mbMJeweZLjZZxSza1EkoqbJW',
  'ETaNwy7JRKRwRohix66mtCR5isnfFhDo4jrjwPMBGgVH',
  '7QNdGcAsS5QH1HTuFNKhuqonAMiYakoYm5KBQtq4oept',
  '82pshMnsfcu7QSY73rLJuwNTPZpUMuxwyQCJv8a8r56y',
  '2RNaWD9eSMM9vxTrWUTindQokSrCmoodAcTvSqT6bBua',
  '653hYwNvm4WxxZvEj2kKZFf2Wd8ZX6RRRSY4Mhq94LZU',
  'Cuuj5ceRXmWbUbwmQ3ZTFjc6snETyEgVooWuM8GYZUkm',
  '69PFGe9D4R7q79Kqbnfk1t4fgWUZPnDseAQ4SGqavhEn',
  'DpS1EWBiDxHaXA3enAYPn66mkpNFMBHsWLcrY8u7MfXP',
  '5JjFQZMPkZwr5upd89Yhco5qLS673vsE8s1zQQ6hpoEa',
  'GjSD3RAhaPzynCAJ6etcyotoN8jZhezWSYFHzxLPfnxz',
  'BXCFZJWHFLhpC4XFrooi3Re1inPGZKEF5D3iBpvAZCd9',
  '4CNzBiHyiQBtXtZHxkXd9tQtpP1DNzVs9LDRYYGCMPCu',
  'EF1KzvEWkkPL5QtUwPMrtCALWF3wHnBVb6Jmh7UW3FHi',
  'DKx266cMed3WM9AbVammnuWSpweqqLw8MoX4jficotpQ',
  'Av2k9PJ8F5BZA62GCgo1YUQ6Cu7kxxy5rSwbrT2gMx7j',
  '7WmQLWZnefNokTw6D4BmWjnQR3Dmh4PMXxJi37u3uFUa',
  '9foBDqeaUb6ej1ft4XE1VGHh4uWwb93994AjV6VJGs5L',
  'ASNgp5exWAWa9CZvrWAbfLStQJKAfVG4k1ssYBTgp15h',
  '6a2MDyASG2hUUHVTYKWWwmVsbaVyoqi9CjLEKFes3oD1',
  'foW5hhaCPc7ZAczKYQTeFbktS48saDPpL3G9Mc82UGh',
  '5mHEfkgEk6TAewF7nt6XYkmZofvtunksqrhT6kRCh4vm',
  '6tsnUVZJXVcAaZ9dFtLv4zX5U6EEg2Jeh1xwDRgwjcNy',
  'CTkYkrBcPjci1D84spAATjkW25hw1kjQAa1QcSUNXfoy',
];
//const connection = new Connection(keys.rpc);

TimeAgo.addDefaultLocale(uk);
const timeAgo = new TimeAgo('uk-UA');

ws.on('open', async function open() {
  // Subscribing to token creation events
  let payload = {
    method: 'subscribeNewToken',
  };
  ws.send(JSON.stringify(payload));
  console.log('open');
});

const users: {
  [name: string]: {
    initBuy: number;
    publicKey: string;
    mint: string;
    startTime: number;
    token: number;
  } | null;
} = {};

const keysMintUser: {
  [mint: string]: string | undefined;
} = {};

const maxToken = 85000000;
const time = 4 * 60 * 1000;
const profit = 0.24;

ws.on('message', async function message(data) {
  const offer = JSON.parse(data as any) as Token;
  if ((offer as any).message) {
    return;
  }

  if (offer.txType === 'create') {
    if (offer.initialBuy >= maxToken) {
      return;
    }

    const initBuy = +(offer.vSolInBondingCurve - 30).toFixed(2);

    users[offer.traderPublicKey] = {
      mint: offer.mint,
      initBuy: initBuy,
      publicKey: offer.traderPublicKey,
      startTime: Date.now(),
      token: Math.floor(offer.initialBuy),
    };
    keysMintUser[offer.mint] = offer.traderPublicKey;

    ws.send(
      JSON.stringify({
        method: 'subscribeAccountTrade',
        keys: [offer.traderPublicKey], // array of token CAs to watch
      }),
    );

    dontRepeat[offer.mint] = offer.mint;
    ws.send(
      JSON.stringify({
        method: 'subscribeTokenTrade',
        keys: [offer.mint], // array of token CAs to watch
      }),
    );

    setTimeout(() => {
      clearUser(offer.traderPublicKey);
    }, time);

    setTimeout(() => {
      ws.send(
        JSON.stringify({
          method: 'unsubscribeTokenTrade',
          keys: [offer.mint], // array of token CAs to watch
        }),
      );
    }, 60 * 1000);
  }

  const user = users[offer.traderPublicKey];

  if (offer.txType === 'sell' && user) {
    if (!user) {
      return;
    }
    if (offer.tokenAmount - user.token > 5000000) {
      console.log(
        '!!! offer.tokenAmount - user.token > 30000000, ',
        `https://pump.fun/${user.mint}`,
      );
      dontRepeat[offer.mint] = null;
      clearUser(offer.traderPublicKey);
      ws.send(
        JSON.stringify({
          method: 'unsubscribeTokenTrade',
          keys: [offer.mint], // array of token CAs to watch
        }),
      );
      return;
    }

    const marketCapSol = offer.marketCapSol / 10 ** 9;
    const price = +(marketCapSol * offer.tokenAmount).toFixed(2);

    console.log(
      'price - user.initBuy >= profit',
      price - user.initBuy >= profit,
      `https://pump.fun/${user.mint}`,
    );
    if (price - user.initBuy >= profit && dontRepeat[user.mint] !== null) {
      dontRepeat[user.mint] = null;
      const res = await parser(user.mint);
      if (res.success) {
        //1.5 * 100 / 1
        const data = res.data!;
        saveToFile(data);
        console.log('Save to file', `https://pump.fun/${user.mint}`);
      }
      clearUser(offer.traderPublicKey);
    } else {
      clearUser(offer.traderPublicKey);
    }
  }

  if (offer.txType === 'buy' && blacklist.includes(offer.traderPublicKey)) {
    console.log('BOT DETECTED');
    dontRepeat[offer.mint] = null;
    const userPublicKey = keysMintUser[offer.mint];
    if (userPublicKey) {
      const user = users[userPublicKey];
      if (user) {
        clearUser(user.publicKey);
        keysMintUser[offer.mint] = undefined;
        console.log('BOT DETECTED CLEAR');
      }
    }

    ws.send(
      JSON.stringify({
        method: 'unsubscribeTokenTrade',
        keys: [offer.mint], // array of token CAs to watch
      }),
    );
  } else if (
    offer.txType === 'buy' &&
    offer.vSolInBondingCurve >= 35.5 &&
    dontRepeat[offer.mint] !== null
  ) {
    dontRepeat[offer.mint] = null;
    ws.send(
      JSON.stringify({
        method: 'unsubscribeTokenTrade',
        keys: [offer.mint], // array of token CAs to watch
      }),
    );
    const res = await parser(offer.mint);
    if (res) {
      //1.5 * 100 / 1
      saveToFile(res.data!);
    }
  }
});

const dontRepeat: {
  [name: string]: string | null;
} = {};

const clearUser = (traderPublicKey: string) => {
  users[traderPublicKey] = null;
  ws.send(
    JSON.stringify({
      method: 'unsubscribeAccountTrade',
      keys: [traderPublicKey],
    }),
  );
};

/*
{
  signature: '4zkKA4NEujCECFGNBWkdmhdtXvcyVimFBkkF8gVs53PiJJWraRtR2W95QRBGSdEAZ5n33ATe5wCsWjMKVAAqZxVL',
  mint: '7LcQjPHv6jmp3DiXFDiLmT9ab2r9p1veB2GbAMjipump',
  traderPublicKey: '8D4eWVA78Rg86o9Txu7pgx8fsyfGGxYm6DfD12epF4c2',
  txType: 'sell',
  tokenAmount: 57542586,
  newTokenBalance: 0.750788,
  bondingCurveKey: 'Du3bw6YVf1zC6Afbj95Tq7WUG4sCYR1NeN8xr7p8qPKo',
  vTokensInBondingCurve: 955636035.962828,
  vSolInBondingCurve: 33.684372280465276,
  marketCapSol: 35.24811854392598
}
{
  mint: '7LcQjPHv6jmp3DiXFDiLmT9ab2r9p1veB2GbAMjipump',
  initBuy: 1.7,
  publicKey: '8D4eWVA78Rg86o9Txu7pgx8fsyfGGxYm6DfD12epF4c2'
}


 */
