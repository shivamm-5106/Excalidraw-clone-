import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";



export function middleware(req:Request,res:Response,next:NextFunction){
    const token = req.headers["authorization"]?? "";

    const decoded = jwt.verify(token,"123123");

    if (decoded){
        req.userId = (decoded as JwtPayload).userId;
        next();
    }
    else{
        res
        .status(403)
        .json({"message":"Unauthorized"})
    }

}