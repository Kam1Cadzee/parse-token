import * as fs from 'fs';
import Token, { PayloadToken } from './types/Token';
import axios from 'axios';
import { terminal } from 'terminal-kit';
import sleep from './sleep';

export const download_image = async (url, image_path) => {
  const response = await axios({
    url,
    responseType: 'stream',
  });
  new Promise<void>((resolve, reject) => {
    try {
      const type = response.headers['content-type'] as string;
      const ext = type.split('/')[1];
      response.data
        .pipe(fs.createWriteStream(`${image_path}.${ext}`))
        .on('finish', () => {
          terminal.green(`${image_path}.${ext} ok\n`);
          resolve();
        })
        .on('error', (e) => {
          terminal.red('ERROR IMAGE\n');
          reject();
        });
    } catch (e) {
      reject();
      return;
    }
  });
};
const saveToFile = async (token: PayloadToken) => {
  const d = new Date();
  const nameFile = `${d.getDate().toString().padStart(2, '0')}.${(
    d.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}.${d.getFullYear().toString()}`;

  const path =
    '/Users/vadimvereketa/Documents/python/static-images/src/json/' +
    nameFile +
    '.json';
  const pathBackup =
    '/Users/vadimvereketa/Documents/python/static-images/src/backup/' +
    nameFile +
    '.json';
  const pathImgFolder =
    '/Users/vadimvereketa/Documents/python/static-images/src/tokens/' +
    nameFile;

  if (!fs.existsSync(path)) {
    if (!fs.existsSync(pathImgFolder)) {
      fs.mkdirSync(pathImgFolder);
    }
    const pathImg = `${pathImgFolder}/${1}`;
    await fs.promises.writeFile(pathBackup, JSON.stringify([token]), {});
    await sleep(250);
    await fs.promises.writeFile(path, JSON.stringify([token]), {});
    try {
      await download_image(token.image_uri, pathImg);
    } catch (e) {
      return {
        success: false,
        error: 'IMAGE',
      };
    }
  }
  let data: PayloadToken[] = [];
  try {
    data = JSON.parse((await fs.promises.readFile(path)).toString());
  } catch (e) {
    return {
      success: false,
      error: 'JSON',
    };
  }

  const findItem = data.find((item) => item.name === token.name);

  if (findItem) {
    const created_timestamp =
      (Date.now() - +findItem.created_timestamp) / 1000 / 60;
    if (created_timestamp <= 60) {
      terminal.red('DUBLICATE:')(
        `https://pump.fun/${token.mint} ${token.name}\n`,
      );
      return {
        success: false,
        error: 'DUBLICATE',
      };
    }
  }

  const pathImg = `${pathImgFolder}/${data.length + 1}`;

  data.push(token);
  await fs.promises.writeFile(pathBackup, JSON.stringify(data), {});
  await sleep(250);
  await fs.promises.writeFile(path, JSON.stringify(data), {});

  try {
    await download_image(token.image_uri, pathImg);
  } catch {
    return {
      success: false,
      error: 'IMAGE',
    };
  }

  return {
    success: true,
  };
};
export const saveToFileTop = async (token: PayloadToken) => {
  const d = new Date();
  const nameFile = `${d.getDate().toString().padStart(2, '0')}.${(
    d.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}.${d.getFullYear().toString()}`;

  const path =
    '/Users/vadimvereketa/Documents/python/how_is_pump/src/data/' +
    nameFile +
    '-TOP.json';

  if (!fs.existsSync(path)) {
    await fs.promises.writeFile(path, JSON.stringify([token]), {});
    return;
  }

  const data: PayloadToken[] = JSON.parse(
    (await fs.promises.readFile(path)).toString(),
  );
  data.push(token);
  await fs.promises.writeFile(path, JSON.stringify(data), {});
};

export default saveToFile;
