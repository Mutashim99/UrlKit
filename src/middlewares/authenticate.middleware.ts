import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.js";

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
// this one is for allowing both the authenticated users and non authenticated users for making short urls without login users and logged in both so that logged in users Id can be fetched from the jwt
export const optionalAuth =  (req:Request,res:Response,next:NextFunction) : void =>{
        const authHeader = req.headers.authorization
        if(authHeader && authHeader.startsWith("Bearer ")){
            const token = authHeader.split(" ")[1]
            try{
            const decoded = verifyToken(token)
           req.user = decoded 
            }
            catch(err){
                req.user = null
            }
        }else{
            req.user = null
        }
        next()
}