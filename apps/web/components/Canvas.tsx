import { useEffect, useRef } from "react";
import { initDraw } from "../draw";
type CanvasProps = {
    slug: string;
    socket: WebSocket;
    roomId: number;
};


export default function Canvas({ slug, socket,roomId }: CanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    console.log("Canvas component rendered with slug:", slug, "and roomId:", roomId);
    useEffect(() => {
        if (canvasRef.current) {
            initDraw(canvasRef.current, slug, socket,roomId);
        }

    }, [canvasRef]);
    return (
        <div>
            <canvas ref={canvasRef} width={5000} height={5000}></canvas>
        </div>
    );
}