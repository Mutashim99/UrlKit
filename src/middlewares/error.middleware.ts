import { NextFunction,Request,Response } from "express";



const errorHandler =  (err : any, req:Request,res:Response,next : NextFunction) => {
    console.log("Error Handler:", err);
    const {status,message} = err

    return res.status(status || 500).json({
        success : false,
        message : message || "Something went wrong"
    })
}

export default errorHandler