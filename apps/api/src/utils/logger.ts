import fs from 'fs';
import path from 'path';

const logsDir = path.resolve(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export const logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${msg}`),
  stream: {
    write: (message: string) => {
      fs.appendFileSync(path.join(logsDir, 'access.log'), message);
    },
  },
};
