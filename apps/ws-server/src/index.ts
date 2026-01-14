import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8000 });

type RectMessage = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type WSMessage =
    | {
        type: "chat";
        roomId: number;
        message: RectMessage;
    }
    | {
        type: "join_room";
        roomId: number;
    }
    | {
        type: "leave_room";
        roomId: number;
    };


interface User {
    ws: WebSocket;
    rooms: number[];
    userId: string;
}

const users: User[] = [];
console.log("WebSocket server started on port 8000", users);

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
    console.log("New WebSocket connection");
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
        let parsedMessage: WSMessage;
        try {
            parsedMessage = JSON.parse(data.toString());
        } catch (e) {
            return;
        }

        if (parsedMessage.type === "join_room") {
            console.log("Received chat message:", parsedMessage);
            const user = users.find(x => x.ws === socket);
            console.log("USER JOIN ROOM:");
            user?.rooms.push(parsedMessage.roomId);
        }

        if (parsedMessage.type === "leave_room") {
            const user = users.find(x => x.ws === socket);
            if (!user) return;
            user.rooms = user.rooms.filter(x => x !== parsedMessage.roomId);
        }

        if (parsedMessage.type === "chat") {
            console.log("Received chat message:", parsedMessage);
            const message = parsedMessage.message;
            const roomId = parsedMessage.roomId;

            try {
                await prismaClient.shape.create({
                    data: {
                        type: "RECT",
                        x: message.x,
                        y: message.y,
                        width: message.width,
                        height: message.height,
                        roomId: roomId,
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


    socket.on("close", () => {
        const index = users.findIndex(x => x.ws === socket);
        if (index !== -1) {
            users.splice(index, 1);
        }
    });
});

