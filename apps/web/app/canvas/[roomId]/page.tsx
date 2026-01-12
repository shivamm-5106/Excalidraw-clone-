"use client"
import { useEffect, useRef } from "react";
import { initDraw } from "../../../draw";



export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);



    useEffect(() => {
        if (canvasRef.current) {
            initDraw(canvasRef.current);
        }

    }, [canvasRef]);

    return (
        <div>
            <canvas ref={canvasRef} width={5000} height={5000}></canvas>
        </div>
    );

}