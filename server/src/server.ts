process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import 'reflect-metadata';
import express, { Application } from 'express';
import winston from 'winston';
import config from './config';
import loader from './loader';
const app: Application = express();

loader(app);

const server = app.listen(config.port, () => {
  winston.info('Running in: ' + config.env);
  winston.info(`Server is running on ${config.port}`);
});

export default server;
