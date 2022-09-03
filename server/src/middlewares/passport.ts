import { Request, Response, NextFunction } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import passport from 'passport';
import config from '../config';
import ETAAuthController from '../controller/ETA/authController';
import userRepository from '../repository/user';
import taxAuthorityTokenRepository from '../repository/taxAuthorityToken';

export const authenticated = (req: Request, res: Response, next: NextFunction) => {
  const { jwt } = config;
  passport
    .use(
      new Strategy(
        {
          secretOrKey: jwt.secret,
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        },
        async (jwtPayload, done) => {
          let user = await userRepository.findOne(jwtPayload.id, ['role', 'role.permissions']);
          let taxAuthorityTokens = await taxAuthorityTokenRepository.findAll();
          for (let token of taxAuthorityTokens) {
            if (token.accessToken) {
              const isTokenExpired = ETAAuthController.isTokenExpired(token.accessToken);
              if (isTokenExpired) {
                const accessToken = await ETAAuthController.generateAccessToken(token.clientID, token.clientSecret);
                if (accessToken) await taxAuthorityTokenRepository.update({ internalId: token.internalId }, { accessToken });
                else return done(null, false);
              }
            } else return done(null, false);
          }
          return done(null, user);
          // getRepository(User)
          //   .findOne(jwtPayload.id, {
          //     select: ['internalId', 'firstName', 'lastName', 'email', 'username', 'taxAuthorityAccessKey', 'isActive'],
          //     relations: ['role'],
          //   })
          //   .then(async (user) => {
          //     if (user) {
          //       const isTokenExpired = ETAAuthController.isTokenExpired(user.taxAuthorityAccessKey);
          //       if (isTokenExpired) {
          //         const taxAuthorityAccessKey = await ETAAuthController.generateAccessToken();
          //         if (taxAuthorityAccessKey) {
          //           await getRepository(User).update(jwtPayload.id, { taxAuthorityAccessKey });
          //           return done(null, { ...user, taxAuthorityAccessKey });
          //         }
          //         return done(null, false);
          //       } else {
          //         return done(null, user);
          //       }
          //     } else {
          //       return done(null, false);
          //     }
          //   })
          //   .catch((err) => {
          //     console.log(err);
          //     return done(err, false);
          //   });
        }
      )
    )
    .authenticate('jwt', { session: false }, (err, user, info) => {
      if (!!info || !!err) {
        return res.status(401).json({
          error: `Unauthenticated access`,
        });
      }
      req.user = user;
      return next();
    })(req, res, next);
};
