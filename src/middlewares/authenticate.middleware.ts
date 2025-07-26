import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";



export const authenticate = (req:Request,res:Response,next:NextFunction) : void => {
    try{
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return next({status : 401,message:"No Token Provided"})
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    req.user = {userId : payload.userId};
    next();
    }catch(err){
        next(err);
    }
}