import * as fs from 'fs';
export type Statistic = {
  creation: number;
  mc: number;
  buys: number;
  sells: number;
  mint: string;
  isFarm: boolean;
  traders: string[];
  name: string;
  symbol: string;
};

export const saveToFileStatistic = async (token: Statistic) => {
  const d = new Date();
  const nameFile = `${d.getDate().toString().padStart(2, '0')}.${(
    d.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}.${d.getFullYear().toString()}`;

  const path =
    '/Users/vadimvereketa/Documents/python/static-images/src/statistic/' +
    nameFile +
    '.json';

  token.traders;
  if (!fs.existsSync(path)) {
    await fs.promises.writeFile(path, JSON.stringify([token]), {});
  }
  let data: (typeof token)[] = [];
  try {
    data = JSON.parse((await fs.promises.readFile(path)).toString());
  } catch (e) {
    return {
      success: false,
      error: 'JSON',
    };
  }

  data.push(token);
  await fs.promises.writeFile(path, JSON.stringify(data), {});
  return {
    success: true,
  };
};
