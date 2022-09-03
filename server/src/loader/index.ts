import { Application } from 'express';
import winstonLoader from './winston';
import expressLoader from './express';
import typeormLoader from './typeormLoader';
import defaultsLoader from './defaults';
import cronJobsLoader from './cronJobs';
import SocketIO from './socket';

import httpServer from '../server';

export default async (expressApp: Application) => {
  await winstonLoader();
  await typeormLoader();
  await defaultsLoader();
  // cronJobsLoader();
  expressLoader(expressApp);
  // SocketIO.init(httpServer);
};
