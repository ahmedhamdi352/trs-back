import { createConnection } from 'typeorm';
import winston from 'winston';
import config from '../config';

export default async () => {
  let { dbConfig }: any = config;
  return createConnection(dbConfig)
    .then(() => {
      winston.info('Connected to DB');
    })
    .catch((err) => {
      winston.log('info', 'Oh no, something went wrong with DB! - ' + err.message);
    });
};
