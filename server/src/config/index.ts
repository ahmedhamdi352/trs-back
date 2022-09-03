import { join, resolve } from 'path';
require('dotenv').config({ path: join(__dirname, '../../.env') });
const {
  NODE_ENV,
  HOST,
  PORT,
  CLIENT_URL,
  JWT_SECRET_KEY,
  JWT_EXPIRES_IN,
  SALT_ROUNDS,
  DB_TYPE,
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_NAME,
  DB_SYNCHRONIZE,
  E_INVOICE_ID_SRV_BASE_URL,
  E_INVOICE_API_BASE_URL,
  E_INVOICE_CLIENT_ID,
  E_INVOICE_CLIENT_SECRET,
  SIGN_SERVICE_URL,
} = process.env;

export default {
  env: NODE_ENV || 'development',
  host: HOST || 'localhost',
  port: PORT || '5000',
  clientURL: CLIENT_URL || '',
  prefix: '/api',
  nonSecureRoutes: ['/'],
  jwt: {
    secret: JWT_SECRET_KEY || 'HVNOhKpiAKyAammO6f7wDvn3KMPLiRHi',
    expires: JWT_EXPIRES_IN || '10h',
  },
  saltRounds: SALT_ROUNDS || 10,
  dbConfig: {
    type: DB_TYPE,
    host: DB_HOST,
    port: Number(DB_PORT) || '',
    username: DB_USERNAME || '',
    password: DB_PASSWORD || '',
    database: DB_NAME || '',
    synchronize: DB_SYNCHRONIZE === 'true',
    logging: false,
    // cache: true,
    entities: [resolve(__dirname, '../entity/**/*.{ts,js}')],
    migrations: [resolve(__dirname, '../migration/*.{ts,js}')],
    subscribers: [resolve(__dirname, '../subscriber/*.{ts,js}')],
    cli: {
      entitiesDir: resolve(__dirname, 'src/entity'),
      migrationsDir: resolve(__dirname, 'src/migration'),
      subscribersDir: resolve(__dirname, 'src/subscriber'),
    },
    connectString: `(DESCRIPTION =(ADDRESS_LIST =(ADDRESS = (PROTOCOL = TCP)(Host = ${DB_HOST})(Port = ${DB_PORT})))(CONNECT_DATA =(sid = ${DB_NAME})(SERVER=dedicated)))`,
  },
  signServiceUrl: SIGN_SERVICE_URL || '',
  taxAuthority: {
    idSrvBaseUrl: E_INVOICE_ID_SRV_BASE_URL || '',
    apiBaseUrl: E_INVOICE_API_BASE_URL || ''
  },
};
