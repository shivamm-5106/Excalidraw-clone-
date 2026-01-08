import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";

const wss = new WebSocketServer({port:8000});

wss.on("connection",(socket,req)=>{
    const url =req.url;

    if(!url){
        return;
    }

    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('tokens') || "";

    const decoded = jwt.verify(token,"123123")

    if(!decoded || !(decoded as JwtPayload).userId){
        wss.close();
        return;
    }

    socket.on("message",(message)=>{
        socket.send(message.toString());
    })
})