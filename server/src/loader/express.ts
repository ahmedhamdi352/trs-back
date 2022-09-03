import express, { Application, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import rateLimit from 'express-rate-limit';
import frameguard from 'frameguard';
import routes from '../routes';
import config from '../config';
import { EAppMode } from '../helper';

export default (app: Application) => {
  app.set('view engine', 'ejs');
  app.use(express.static(path.join(__dirname, '../public')));
  app.set('trust proxy', 1);
  if (config.env === EAppMode.production) {
    var whitelist = [config.clientURL];
    var corsOptions: any = {
      origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
    };
  } else {
    var corsOptions: any = { origin: true };
  }
  app.use(cors(corsOptions));
  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false, limit: '1000kb' }));
  app.use(bodyParser.json());
  app.use(helmet());
  // Don't allow me to be in ANY frames:
  app.use(frameguard({ action: 'deny' }));
  app.use(compression());

  // limit each IP to 6 requests per windowMs (1 Min.)
  app.use(rateLimit({ windowMs: 60 * 1000, max: 60 }));
  app.use(config.prefix, routes);
  app.get('/health', (_, res: Response) => {
    res.status(200).send('OK');
  });

  // error handler for unmatched routes or api calls
  app.get('/', (_, res: Response) => {
    res.sendFile(path.join(__dirname, '../public', '404.html'));
  });

  app.use(function (req, res, next) {
    res.status(404);
    res.json({ status: 404, error: 'Route not found' });
    next();
  });
};
