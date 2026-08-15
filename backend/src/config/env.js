const dotenv = require('dotenv');
const path = require('path');

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const REQUIRED_ENV = [
  'MONGO_URI',
  'JWT_SECRET',
  'CLIENT_URL',
];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

const nodeEnv = process.env.NODE_ENV || 'development';

if (nodeEnv === 'production') {
  const emailEnv = [
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'EMAIL_FROM',
  ];
  const emailMissing = emailEnv.filter((key) => !process.env[key]);
  if (emailMissing.length > 0) {
    throw new Error(`Missing required email environment variables: ${emailMissing.join(', ')}`);
  }
}

const clientUrls = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: clientUrls[0],
  clientUrls,
  emailHost: process.env.EMAIL_HOST,
  emailPort: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined,
  emailUser: process.env.EMAIL_USER,
  emailPassword: process.env.EMAIL_PASSWORD,
  emailFrom: process.env.EMAIL_FROM,
  emailSecure: process.env.EMAIL_SECURE === 'true',
  nodeEnv,
};
