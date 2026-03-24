import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";

export interface CustomRequest extends Request {
    userId?: string;
}

export function middleware(req: CustomRequest, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        console.log("🔹 Raw Auth Header:", authHeader);

        if (!authHeader) {
            return res.status(403).json({ message: "No token provided" });
        }

        const token= authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : authHeader ;

        console.log(" Extracted Token:", token);

        const decoded = jwt.verify(token || "", JWT_SECRET) as JwtPayload;

        console.log("Decoded Payload:", decoded);

        if (!decoded || !decoded.userId) {
            return res.status(403).json({ message: "Invalid token" });
        }

        req.userId = decoded.userId;

        next();
    } catch (e) {
        console.log("Middleware Error:", e);
        return res.status(403).json({ message: "Unauthorized" });
    }
}