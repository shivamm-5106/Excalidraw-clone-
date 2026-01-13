"use client"

import { useEffect, useRef, useState } from "react";
import { WS_URL } from "../config";
import Canvas from "./Canvas";
type CanvasProps = {
    slug: string;
    roomId: Number;
};
export default function RoomCanvas({ slug,roomId }:CanvasProps ) {

    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(WS_URL);
        ws.onopen = () => {
            setSocket(ws);
            ws.send(JSON.stringify({
                type: "join_room",
                roomId:roomId
            }));
        }
    }, []);

    if (!socket) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <Canvas slug={slug} socket={socket} />
        </div>
    );
}