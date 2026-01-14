import axios from "axios";
import { BACKEND_URL } from "../config";

type Shape = {
    type: "RECT";
    x: number;
    y: number;
    width: number;
    height: number;
}




export async function initDraw(canvas: HTMLCanvasElement, slug: string, socket: WebSocket, roomId: number) {
    const ctx = canvas.getContext("2d");

    let existingShape: Shape[] = await getExistingShapes(slug);

    if (!ctx) return;


    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        clearCanvas(ctx, canvas, existingShape);

        if (data.type === "chat") {
            existingShape.push(data.message);
            clearCanvas(ctx, canvas, existingShape);
        }
    };


    clearCanvas(ctx, canvas, existingShape);

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
        const shape: Shape = {
            type: "RECT",
            x: startX,
            y: startY,
            width,
            height,
        }

        existingShape.push(shape);

        socket.send(JSON.stringify({
            type: "chat",
            roomId,   // MUST EXIST
            message: {
                x: shape.x,
                y: shape.y,
                width: shape.width,
                height: shape.height,
                type: "RECT"
            }
        }));



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
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);

    });
}

async function getExistingShapes(slug: string) {
    const res = await axios.get(`${BACKEND_URL}/chats/${slug}`);

    const shapes: Shape[] = res.data.messages;

    if (!shapes) {
        return [];
    }

    const data = shapes;

    return data;
}



