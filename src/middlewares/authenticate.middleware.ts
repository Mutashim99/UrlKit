import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.js";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token: string = req.cookies.token;

    if (!token) {
      return next({ status: 401, message: "No Token Provided,UnAuthorized" });
    }

    const payload = verifyToken(token);
    req.user = { userId: payload.userId };
    next();
  } catch (err) {
    next(err);
  }
};
// this one is for allowing both the authenticated users and non authenticated users for making short urls without login users and logged in both so that logged in users Id can be fetched from the jwt
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token: string = req.cookies.token;
  if (token) {
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (err) {
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};
