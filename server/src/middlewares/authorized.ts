import { Request, Response, NextFunction } from 'express';
import { EUserRole } from '../helper';
export function authorized(allowed: Array<EUserRole>) {
  const isAllowed = (userRoles: Array<string>) => userRoles.some((role: any) => allowed.includes(role));
  return (req: Request, res: Response, next: NextFunction) => {
    let { role }: any = req.user;
    if (!!role && isAllowed([role.name])) {
      return next();
    }
    return res.status(403).json({ error: 'Unauthorized access' });
  };
}
