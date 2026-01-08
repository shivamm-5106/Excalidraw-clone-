import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import {JWT_SECRET} from '@repo/backend-common/config'

const wss = new WebSocketServer({port:8000});

wss.on("connection",(socket,req)=>{
    const url =req.url;

    if(!url){
        return;
    }

    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('tokens') || JWT_SECRET;

    const decoded = jwt.verify(token,JWT_SECRET)

    if (typeof decoded == "string"){
        wss.close();
        return;
    }

    if(!decoded || !decoded.userId){
        wss.close();
        return;
    }

    socket.on("message",(message)=>{
        socket.send(message.toString());
    })
})