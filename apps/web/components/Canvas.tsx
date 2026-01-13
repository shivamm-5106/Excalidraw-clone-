import { useEffect, useRef } from "react";
import { initDraw } from "../draw";
type CanvasProps = {
    slug: string;
    socket: WebSocket;
};


export default function Canvas({ slug, socket }: CanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        if (canvasRef.current) {
            initDraw(canvasRef.current, slug, socket);
        }

    }, [canvasRef]);
    return (
        <div>
            <canvas ref={canvasRef} width={5000} height={5000}></canvas>
        </div>
    );
}