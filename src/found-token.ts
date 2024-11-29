import WebSocket from 'ws';
import Token from './types/Token';
import { terminal } from 'terminal-kit';
import saveToFile, { download_image } from './Storage';
import parser from './parser/parser';
import uk from 'javascript-time-ago/locale/uk';
import TimeAgo from 'javascript-time-ago';
import { Connection } from '@solana/web3.js';
import { saveToFileStatistic, Statistic } from './types/Statistic';
import express from 'express';
import http from 'http';
TimeAgo.addDefaultLocale(uk);
const timeAgo = new TimeAgo('uk-UA');

type TypeTopTrader = {
  time: number;
  address: string;
};

let TOP_TRADERS = [];

const connection = new Connection('https://api.mainnet-beta.solana.com');

type FuncRQ = keyof Pick<InfoToken, 'save' | 'saveStatistic'>;

class RequestQueue {
  queue: InfoToken[];
  isProcessing: boolean;
  name: FuncRQ;

  constructor(name: FuncRQ) {
    this.queue = []; // черга запитів
    this.isProcessing = false; // стан обробки запитів
    this.name = name;
  }

  // Додавання запиту до черги
  addRequest(item: InfoToken) {
    this.queue.push(item);
    this.processQueue();
  }

  // Обробка черги запитів
  async processQueue() {
    if (this.isProcessing) return; // Якщо вже обробляється, виходимо

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift(); // Витягуємо перший запит з черги

      try {
        if (this.name === 'save') {
          await item?.save(); // Виконуємо запит
        } else if (this.name === 'saveStatistic') {
          await item?.saveStatistic(); // Виконуємо запит
        }
      } catch (error) {
        console.log(error);
      }
    }

    this.isProcessing = false; // Завершення обробки черги
  }
}

const ws = new WebSocket('wss://pumpportal.fun/api/data');

ws.on('open', async function open() {
  // Subscribing to token creation events
  let payload = {
    method: 'subscribeNewToken',
  };
  ws.send(JSON.stringify(payload));
});

const maxToken = 80000000;
const time = 2.8 * 60 * 1000;
const profit = 37;
const buys = 6;

const blacklist = [
  'EVPC9UYyWCABcjmK6djuCZzFjXSLt7LgMD7YkgMddwyY',
  'GdaY85VQGt26cZpFoZWTcb1PdqNVx3fZYCrLghC7PMxK',
  'Cuuj5ceRXmWbUbwmQ3ZTFjc6snETyEgVooWuM8GYZUkm',
  '44FUfUxNtGsWRVigDGatXQk9oTc6k72zQ9ohkUktpump',
  'RjkV1qBs9Pah342Rp7wiv6Cq1JgYuoMuJEXc5bGfYKb',
  'HXAxboY4nf9MwL9FYsWJpxPSqVJfULdEMPmUvzz36PvY',
  '5SLfwydtwBn8y6RCGu4uPjLy7qATmXmpnvpDLgkpp4e8',
  '37QxNTN5GMcPTgY7SMb4KorL7cStRXrh3PAXpKKrMB8u',
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
  '6YUqJww1dxhfRPJBxyxZszdtpmUhSPeFvkFEVtNgTJRA',
  '8ndBzCSmP48QNwFmfVN1sr4kj6c9SsY3QuUexmLoxtVi',
  '9foBDqeaUb6ej1ft4XE1VGHh4uWwb93994AjV6VJGs5L',
  'ASNgp5exWAWa9CZvrWAbfLStQJKAfVG4k1ssYBTgp15h',
  '6a2MDyASG2hUUHVTYKWWwmVsbaVyoqi9CjLEKFes3oD1',
  'foW5hhaCPc7ZAczKYQTeFbktS48saDPpL3G9Mc82UGh',
  '5mHEfkgEk6TAewF7nt6XYkmZofvtunksqrhT6kRCh4vm',
  '6tsnUVZJXVcAaZ9dFtLv4zX5U6EEg2Jeh1xwDRgwjcNy',
  'CTkYkrBcPjci1D84spAATjkW25hw1kjQAa1QcSUNXfoy',
  '6SvCMVPE1nsFJFSNUXvhW4Ey6MGdsuvg4gJSsp6bt8e2',
  '7bHDmmTR5L8CkZewdnhWTV98AAQ95xTCzEKmVWDmfMjk',
  '5zGE4JDL9D8YvCvKjUNbPA7uEiZs6ArHrwrieKnqkm5d',
  '6SvCMVPE1nsFJFSNUXvhW4Ey6MGdsuvg4gJSsp6bt8e2',
  'G1sC4LiNSPTfoBdbSRzDvX63VV68p9PY2hf19CKXogJP',
  '6knaHZrx2bVceYGUR7d8Tew5dCCTeMz3H4vS6rd6VSwE',
  '3Ahi35beX1JJMKYXqYCFUvJttVkwkaiLCGGZpBqq6tbe',
  'ByFtuuc3hnZo6hPnT4RUNXQkHW8hJ1EU79x3TfGuidcU',
];

class InfoToken {
  token: Token;
  creationTime: number;
  buy: number = 1;
  sell: number;
  initBuy: number;
  mc: number;
  timer: NodeJS.Timeout | undefined;
  profit: number = 0;
  signature: string | undefined;
  initToken: number;
  traders: Set<string>;
  isFarm: boolean = false;
  isAddRequest: boolean = false;

  sells: {
    [name: string]: number;
  } = {};

  buys: {
    [name: string]: number;
  } = {};

  constructor(token: Token) {
    this.traders = new Set<string>([token.traderPublicKey]);
    this.token = token;
    this.creationTime = Date.now();
    this.buy = 1;
    this.sell = 0;
    this.initBuy = +(token.vSolInBondingCurve - 30).toFixed(2);
    this.mc = token.vSolInBondingCurve;
    this.initToken = token.initialBuy;
  }

  addTrader(trader: string) {
    this.traders.add(trader);
  }

  getTimeFromCreation() {
    return (Date.now() - this.creationTime) / 1000;
  }

  setMc(value: number) {
    this.mc = Math.max(this.mc, value);
  }

  info(type: 'CREATE' | 'REMOVE', reason = '') {
    const color = type === 'CREATE' ? 'green' : 'red';
    terminal[color](type + ' ')(
      `https://pump.fun/${this.token.mint} ${reason}\n`,
    );
  }

  async save() {
    const res = await parser(this.token.mint);
    if (res.success) {
      //1.5 * 100 / 1
      const data = res.data!;
      data.initBuy = this.initBuy;
      data.mc = this.mc;
      data.profit = this.profit;
      const r = await saveToFile(data);
      if (r.success) {
        this.info('CREATE');
      } else {
        this.info('REMOVE', r.error);
      }
    } else {
      this.info('REMOVE', res.error);
    }
  }

  async saveStatistic() {
    const data: Statistic = {
      buys: this.buy,
      sells: this.sell,
      creation: this.creationTime,
      isFarm: this.isFarm,
      mc: this.mc,
      mint: this.token.mint,
      traders: Array.from(this.traders),
      name: this.token.name,
      symbol: this.token.symbol,
    };

    await saveToFileStatistic(data);
  }

  async changePrice() {
    const price = await this.getPriceByTrans();

    if (price !== 0) {
      const profit = price - this.initBuy;
      this.profit = profit;
    }
  }

  async getPriceByTrans() {
    if (!this.signature) {
      return 0;
    }
    try {
      const res = await connection.getTransaction(this.signature, {
        maxSupportedTransactionVersion: 0,
        commitment: 'confirmed',
      });
      const pre = res?.meta?.preBalances[0] ?? 0;
      const post = res?.meta?.postBalances[0] ?? 0;
      const profit = (post - pre) / 10 ** 9;

      return profit;
    } catch (e) {
      console.log(e);
      return 0;
    }
  }
}

class Tokens {
  tokens: {
    [mint: string]: InfoToken | undefined;
  } = {};

  mints: {
    [user: string]: string | undefined;
  } = {};

  queue = new RequestQueue('save');
  queueStatistics = new RequestQueue('saveStatistic');

  constructor() {
    this.tokens = {};
    this.mints = {};
  }

  addToken(token: InfoToken) {
    if (!!this.tokens[token.token.mint]) {
      console.log('Duplicate token: ', `https://pump.fun/${token.token.mint}`);
      return;
    }
    this.tokens[token.token.mint] = token;

    this.mints[token.token.traderPublicKey] = token.token.mint;

    ws.send(
      JSON.stringify({
        method: 'subscribeTokenTrade',
        keys: [token.token.mint], // array of token CAs to watch
      }),
    );

    const timer = setTimeout(() => {
      this.checkToAdd(token);
      this.clear(token, false);
    }, time);

    token.timer = timer;
  }

  async checkToAdd(info: InfoToken) {
    if (info.mc >= profit && (info.buy >= buys || info.sell >= buys)) {
      await info.changePrice();
      this.queue.addRequest(info);
    }
  }

  getTokenByMint(mint: string) {
    return this.tokens[mint];
  }

  getTokenByUser(user: string) {
    const mint = this.mints[user];
    return mint ? this.getTokenByMint(mint) : undefined;
  }

  clear(info: InfoToken, isFarm = false) {
    info.isFarm = isFarm;
    console.log(
      'Clear: ',
      `https://pump.fun/${info.token.mint}`,
      'MC: ',
      info.mc,
      'BUYS: ',
      info.buy,
    );
    if (info.isAddRequest === false) {
      info.isAddRequest = true;
      this.queueStatistics.addRequest(info);
    }

    tokens[info.token.mint] = undefined;
    this.mints[info.token.traderPublicKey] = undefined;
    clearTimeout(info.timer);
    ws.send(
      JSON.stringify({
        method: 'unsubscribeTokenTrade',
        keys: [info.token.mint], // array of token CAs to watch
      }),
    );
  }

  buy(offer: Token) {
    const info = this.getTokenByMint(offer.mint);
    if (!info) {
      return;
    }

    const marketCapSol = offer.marketCapSol / 10 ** 9;
    const price = marketCapSol * offer.tokenAmount;

    if (price >= 0.8) {
      info.addTrader(offer.traderPublicKey);
    }
    info.buy += 1;
    info.setMc(offer.vSolInBondingCurve);

    const time = Math.floor(Date.now() / 1000);

    if (info.buys[time]) {
      info.buys[time] = info.buys[time] + 1;
    } else {
      info.buys[time] = 1;
    }

    if (info.getTimeFromCreation() <= 1.2 && info.buy >= 7) {
      info.info(
        'REMOVE',
        '                          info.getTimeFromCreation() <= 1.2 && info.buy >= 8',
      );
      this.clear(info, true);
      return;
    }

    if (info.getTimeFromCreation() <= 3 && info.mc > 45) {
      info.info(
        'REMOVE',
        '                          info.getTimeFromCreation() <= 3 && info.mc > 12',
      );
      this.clear(info, true);
      return;
    }

    if (
      info.getTimeFromCreation() <= 3 &&
      blacklist.includes(offer.traderPublicKey)
    ) {
      const findKey = blacklist.find((item) => item === offer.traderPublicKey)!;

      info.info(
        'REMOVE',
        `                          blacklist.includes(offer.traderPublicKey) ${findKey}`,
      );
      this.clear(info, true);
      return;
    }
  }

  async sell(offer: Token) {
    const info = this.getTokenByMint(offer.mint);
    if (!info) {
      return;
    }

    const marketCapSol = offer.marketCapSol / 10 ** 9;
    const price = marketCapSol * offer.tokenAmount;

    if (price >= 0.8) {
      info.addTrader(offer.traderPublicKey);
    }
    info.sell += 1;
    const time = Math.floor(Date.now() / 1000);

    if (info.sells[time]) {
      info.sells[time] = info.sells[time] + 1;
    } else {
      info.sells[time] = 1;
    }

    const isDev = offer.traderPublicKey === info.token.traderPublicKey;

    if (isDev && offer.tokenAmount > info.initToken) {
      info.info(
        'REMOVE',
        '                          isDev && offer.tokenAmount > info.initToken',
      );
      this.clear(info, true);
      return;
    }

    if (isDev) {
      const marketCapSol = offer.marketCapSol / 10 ** 9;
      const price = +(marketCapSol * offer.tokenAmount).toFixed(2);

      info.signature = offer.signature;

      const profit = price - info.initBuy;
      info.profit = profit;
    }

    if (info.sells[time] >= 8) {
      info.info('REMOVE', '                          info.sells[time] >= 5');
      this.clear(info, true);
      return;
    }
  }
}

const tokens = new Tokens();

ws.on('message', async function message(data) {
  const offer = JSON.parse(data as any) as Token;
  if ((offer as any).message) {
    return;
  }

  if (offer.txType === 'create') {
    if (offer.initialBuy >= maxToken) {
      return;
    }

    tokens.addToken(new InfoToken(offer));
  }
  if (offer.txType === 'buy') {
    tokens.buy(offer);
  }
  if (offer.txType === 'sell') {
    tokens.sell(offer);
  }
});
