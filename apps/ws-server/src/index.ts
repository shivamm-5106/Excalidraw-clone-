import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: Number(process.env.PORT) || 8000 });

type ShapeMessage = {
    id: string;
    type: "RECT" | "ELLIPSE" | "DIAMOND" | "LINE" | "ARROW" | "TEXT" | "FREEHAND";
    data: Record<string, unknown>;
};

type WSMessage =
    | {
        type: "chat";
        roomId: number;
        message: ShapeMessage;
    }
    | {
        type: "delete_shape";
        roomId: number;
        shapeId: string;
    }
    | {
        type: "sync_shapes";
        roomId: number;
        shapes: ShapeMessage[];
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
console.log("WebSocket server started on port 8000");

function checkUser(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded == "string") return null;
        if (!decoded || !decoded.userId) return null;
        return decoded.userId;
    } catch (e) {
        return null;
    }
}

wss.on("connection", (socket, req) => {
    const origin = req.headers.origin;
    const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";
    if (origin && origin !== allowedOrigin) {
        socket.close();
        return;
    }
    const url = req.url;
    if (!url) return;

    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || "";
    const userId = checkUser(token);

    if (!userId) {
        socket.close();
        return;
    }

    users.push({ userId, rooms: [], ws: socket });

    socket.on("message", async (data) => {
        let parsedMessage: WSMessage;
        try {
            parsedMessage = JSON.parse(data.toString());
        } catch (e) {
            return;
        }

        if (parsedMessage.type === "join_room") {
            const user = users.find(x => x.ws === socket);
            if (user && !user.rooms.includes(parsedMessage.roomId)) {
                user.rooms.push(parsedMessage.roomId);
            }
        }

        if (parsedMessage.type === "leave_room") {
            const user = users.find(x => x.ws === socket);
            if (!user) return;
            user.rooms = user.rooms.filter(x => x !== parsedMessage.roomId);
        }

        if (parsedMessage.type === "chat") {
            const message = parsedMessage.message;
            const roomId = parsedMessage.roomId;

            try {
                const dataValue = message.data || {};
                const dataStr = JSON.stringify(dataValue);

                await prismaClient.shape.upsert({
                    where: { id: message.id },
                    create: {
                        id: message.id,
                        type: message.type,
                        data: dataStr,
                        roomId: roomId,
                        userId: userId
                    },
                    update: {
                        type: message.type,
                        data: dataStr,
                    }
                });
            } catch (e) {
                console.error("Error storing message to DB", e);
                return;
            }

            users.forEach(user => {
                if (user.rooms.includes(roomId) && user.ws !== socket) {
                    user.ws.send(JSON.stringify({
                        type: "chat",
                        message: message,
                        roomId: roomId
                    }));
                }
            });
        }

        if (parsedMessage.type === "delete_shape") {
            const roomId = parsedMessage.roomId;
            const shapeId = parsedMessage.shapeId;

            try {
                await prismaClient.shape.delete({
                    where: { id: shapeId }
                });
            } catch (e) {
                console.error("Error deleting shape from DB", e);
                return;
            }

            users.forEach(user => {
                if (user.rooms.includes(roomId) && user.ws !== socket) {
                    user.ws.send(JSON.stringify({
                        type: "delete_shape",
                        shapeId,
                        roomId
                    }));
                }
            });
        }

        if (parsedMessage.type === "sync_shapes") {
            const roomId = parsedMessage.roomId;
            const shapes = parsedMessage.shapes;

            try {
                await prismaClient.shape.deleteMany({
                    where: { roomId }
                });

                for (const shape of shapes) {
                    const dataValue = shape.data || {};
                    const dataStr = JSON.stringify(dataValue);
                    await prismaClient.shape.create({
                        data: {
                            id: shape.id,
                            type: shape.type,
                            data: dataStr,
                            roomId,
                            userId
                        }
                    });
                }
            } catch (e) {
                console.error("Error syncing shapes to DB", e);
                return;
            }

            users.forEach(user => {
                if (user.rooms.includes(roomId) && user.ws !== socket) {
                    user.ws.send(JSON.stringify({
                        type: "sync_shapes",
                        roomId,
                        shapes
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
