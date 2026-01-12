import axios from "axios";
import { BACKEND_URL } from "../config";

type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {

    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;

};
let existingShape: Shape[] = [];

export function initDraw(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = "white"
    let clicked = false;

    let startX = 0;
    let startY = 0;
    canvas.addEventListener("mousedown", (e) => {
        const rect = canvas.getBoundingClientRect();
        clicked = true;
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
    });

    canvas.addEventListener("mouseup", (e) => {
        clicked = false;

        const rect = canvas.getBoundingClientRect();
        const width = e.clientX - rect.left - startX;
        const height = e.clientY - rect.top - startY;

        existingShape.push({
            type: "rect",
            x: startX,
            y: startY,
            width,
            height,
        });

        clearCanvas(ctx, canvas, existingShape);
    });

    canvas.addEventListener("mousemove", (e) => {
        if (!clicked) return;
        const rect = canvas.getBoundingClientRect();
        const width = e.clientX - startX - rect.left;
        const height = e.clientY - startY - rect.top;

        clearCanvas(ctx, canvas, existingShape);
        ctx.strokeRect(startX, startY, width, height);
    });


}

function clearCanvas(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    existingShape: Shape[]
) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "white";

    existingShape.forEach((shape) => {
        if (shape.type === "rect") {
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        } else {
            ctx.beginPath();
            ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    });
}

async function getExistingShapes(roomId: string) {
    const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`);

    const shapes: Shape[] = res.data.shapes;

    const data = shapes.map((x) => {
        if (x.type === "rect") {
            return {
                type: "rect",
                x: x.x,
                y: x.y,
                width: x.width,
                height: x.height,
            };
        } else {
            return {
                type: "circle",
                centreX: x.centerX,
                centerY: x.centerY,
                radius: x.radius,
            };
        }
    });


}

function drawShapes(
    ctx: CanvasRenderingContext2D,
    shapes: Shape[]
) {
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.strokeStyle = "white";

    existingShape.forEach((shape) => {
        if (shape.type === "rect") {
            ctx.strokeRect(
                shape.x,
                shape.y,
                shape.width,
                shape.height
            );
        } else {
            ctx.beginPath();
            ctx.arc(
                shape.centerX,  
                shape.centerY,
                shape.radius,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        }
    });
}
