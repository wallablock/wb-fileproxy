import { NextFunction, RequestHandler } from "express";

export function endpoint(callback: RequestHandler): RequestHandler {
  return async function (req: any, res: any, next: NextFunction) {
    try {
      return await callback(req, res, next);
    } catch (err) {
      // Handle 500 errors
      return next(err);
    }
  };
}
