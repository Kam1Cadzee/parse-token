import axios from 'axios';
import { terminal } from 'terminal-kit';
import { PayloadToken } from '../types/Token';

const parser = async (mint: string) => {
  // \\"created_timestamp\\":\s*(\d+)
  // <meta\s+name="description"\s+content="([^"]*)"
  // \\"symbol\\":\\"([^"]+)\\"
  // \\"name\\":\\"([^"]+)\\"
  // \\"image_uri\\":\\"([^"]+)\\"
  // \\"twitter\\":\\"([^"]+)\\"
  // \\"telegram\\":\\"([^"]+)\\"
  // \\"website\\":\\"([^"]+)\\"
  const url = `https://pump.fun/${mint}`;

  try {
    const html = (await axios.get(url)).data as string;

    const data: PayloadToken = {
      created_timestamp: '',
      description: '',
      symbol: '',
      name: '',
      image_uri: '',
      twitter: '',
      telegram: '',
      website: '',
      url,
      mint,
      initBuy: 0,
      mc: 0,
      profit: 0,
    };
    const regexes = {
      created_timestamp: /\\"created_timestamp\\":\s*(\d+)/,
      description: /<meta\s+name="description"\s+content="([^"]*)"/,
      symbol: /\\"symbol\\":\\"([^"]+)\\"/,
      name: /\\"name\\":\\"([^"]+)\\"/,
      image_uri: /\\"image_uri\\":\\"([^"]+)\\"/,
      twitter: /\\"twitter\\":\\"([^"]+)\\"/,
      telegram: /\\"telegram\\":\\"([^"]+)\\"/,
      website: /\\"website\\":\\"([^"]+)\\"/,
    };

    //I&#x27;m Cop
    Object.keys(regexes).forEach((regex) => {
      const match = html.match(regexes[regex]);

      if (match) {
        const value = match[1];
        data[regex] = value.replace('&#x27;', "'");
      }
    });

    const split = data.image_uri.split('/');
    const img = split[split.length - 1];

    data.image_uri =
      'https://pump.mypinata.cloud/ipfs/' +
      img +
      '?img-width=256&img-dpr=2&img-onerror=redirect';

    return {
      success: true,
      data: data,
    };
  } catch (e) {
    terminal.red('ERROR:::::::', e.code, url);
    return {
      success: false,
      error: `${e.code}`,
    };
  }
};

export default parser;
