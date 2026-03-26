import axios from "axios";

type Shape = {
    type: "RECT";
    x: number;
    y: number;
    width: number;
    height: number;
}




export function initDraw(canvas: HTMLCanvasElement, slug: string, socket: WebSocket, roomId: number) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => {};

    let existingShapes: Shape[] = [];

    getExistingShapes(slug).then((shapes) => {
        existingShapes = shapes;
        clearCanvas(ctx, canvas, existingShapes);
    });

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            if (data.type === "chat") {
                const parsedShape = data.message;
                existingShapes.push(parsedShape);
                clearCanvas(ctx, canvas, existingShapes);
            }
            if (data.type === "join_room") {
                clearCanvas(ctx, canvas, existingShapes);
            }
        } catch (e) {
            console.error(e);
        }
    };

    clearCanvas(ctx, canvas, existingShapes);

    let clicked = false;
    let startX = 0;
    let startY = 0;

    const handleMouseDown = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        clicked = true;
        startX = e.clientX - rect.left;
        startY = e.clientY - rect.top;
    };

    const handleMouseUp = (e: MouseEvent) => {
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
        };

        existingShapes.push(shape);

        socket.send(JSON.stringify({
            type: "chat",
            roomId,
            message: {
                type: "RECT",
                x: shape.x,
                y: shape.y,
                width: shape.width,
                height: shape.height
            }
        }));

        clearCanvas(ctx, canvas, existingShapes);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!clicked) return;
        const rect = canvas.getBoundingClientRect();
        const width = e.clientX - startX - rect.left;
        const height = e.clientY - startY - rect.top;

        clearCanvas(ctx, canvas, existingShapes);
        ctx.strokeStyle = "white";
        ctx.strokeRect(startX, startY, width, height);
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mousemove", handleMouseMove);
        socket.onmessage = null;
    };
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
    const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${slug}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    const shapes: Shape[] = res.data.messages;

    if (!shapes) {
        return [];
    }

    const data = shapes;

    return data;
}



