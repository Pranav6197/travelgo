import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const configDirectory = path.dirname(fileURLToPath(import.meta.url));
const environmentFile = path.resolve(configDirectory, '..', '.env');

dotenv.config({ path: environmentFile });
