"use client"

import { useEffect, useRef, useState } from "react";
import { WS_URL } from "../config";
import Canvas from "./Canvas";
type CanvasProps = {
    slug: string;
    roomId: number;
};
export default function RoomCanvas({ slug, roomId }: CanvasProps) {

    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        console.log("TOKEN:", token);
        if (!token) {
            throw new Error("No token found");
        }
        const ws = new WebSocket(`${WS_URL}?token=${token}`);
        ws.onopen = () => {
            setSocket(ws);
            console.log("WebSocket connected");

            ws.send(JSON.stringify({
                type: "join_room",
                roomId: roomId
            }));
        }
        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        }
    }, []);

    if (!socket) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <Canvas slug={slug} socket={socket} roomId={roomId}/>
        </div>
    );
}