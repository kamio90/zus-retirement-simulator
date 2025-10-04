import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export function loadEnv() {
  // Placeholder for advanced env validation
}
