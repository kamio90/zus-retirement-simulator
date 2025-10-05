import fs from 'fs';
import path from 'path';

const logsDir = process.env.LOG_PATH 
  ? path.dirname(process.env.LOG_PATH)
  : path.resolve(__dirname, '../../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = process.env.LOG_PATH || path.join(logsDir, 'access.log');

export const logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${msg}`),
  stream: {
    write: (message: string) => {
      fs.appendFileSync(logFilePath, message);
    },
  },
};
