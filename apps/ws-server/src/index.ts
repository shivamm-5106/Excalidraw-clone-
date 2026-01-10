import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8000 });

interface User {
    ws: WebSocket;
    rooms: string[]; 
    userId: string;
}

const users: User[] = [];

function checkUser(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (typeof decoded == "string") {
            return null;
        }

        if (!decoded || !decoded.userId) {
            return null;
        }

        return decoded.userId;
    } catch (e) {
        return null;
    }
}

wss.on("connection", (socket, req) => {
    const url = req.url;
    if (!url) return;

    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || ""; 

    const userId = checkUser(token);

    if (!userId) {
        socket.close();
        return;
    }

    users.push({
        userId,
        rooms: [],
        ws: socket
    });

    socket.on("message", async (data) => {
        let parsedMessage;
        try {
            parsedMessage = JSON.parse(data.toString());
        } catch (e) {
            return;
        }

        if (parsedMessage.type === "join_room") {
            const user = users.find(x => x.ws === socket);
            user?.rooms.push(parsedMessage.roomId); 
        }

        if (parsedMessage.type === "leave_room") {
            const user = users.find(x => x.ws === socket);
            if (!user) return;
            user.rooms = user.rooms.filter(x => x !== parsedMessage.roomId);
        }

        if (parsedMessage.type === "chat") {
            const roomId = parsedMessage.roomId;
            const message = parsedMessage.message;

            try {
                await prismaClient.chat.create({
                    data: {
                        roomId: Number(roomId),
                        message: message,
                        userId: userId
                    }
                });
            } catch (e) {
                console.error("Error storing message to DB", e);
                return; 
            }


            users.forEach(user => {
                if (user.rooms.includes(roomId)) {
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        message: message,
                        roomId: roomId
                    }));
                }
            });
        }
    });


    socket.on("disconnect", () => {
        const index = users.findIndex(x => x.ws === socket);
        if (index !== -1) {
            users.splice(index, 1);
        }
    });
});

