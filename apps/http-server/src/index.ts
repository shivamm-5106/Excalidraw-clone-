import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; 
import { middleware } from './middleware';
import { JWT_SECRET } from '@repo/backend-common/config';
import { CreateUserSchema, SignInSchema, CreateRoomSchema } from '@repo/common/types';
import { prismaClient } from "@repo/db/client";
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post("/signup", async (req, res) => {
    const parsedData = CreateUserSchema.safeParse(req.body);

    if (!parsedData.success) {
        return res.status(400).json({ message: "Incorrect inputs" });
    }

    try {
        
        const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);

        const user = await prismaClient.user.create({
            data: {
                username: parsedData.data.username,
                password: hashedPassword, 
                name: parsedData.data.name,
            },
        });

        return res.json({
            userId: user.id
        });
    } catch (error) {
        return res.status(409).json({
            message: "User already exists with this username",
        });
    }
});

app.post("/signin", async (req, res) => {
    const data = SignInSchema.safeParse(req.body);
    if (!data.success) {
        return res.status(400).json({ message: "Incorrect inputs" });
    }


    const user = await prismaClient.user.findFirst({
        where: {
            username: data.data.username
        }
    });

    if (!user) {
        return res.status(403).json({ message: "invalid username" });
    }


    const isPasswordValid = await bcrypt.compare(data.data.password, user.password);

    if (!isPasswordValid) {
        return res.status(403).json({ message: "Invalid credentials" });
    }


    const token = jwt.sign({
        userId: user.id
    }, JWT_SECRET);


    res.json({
        token: token
    });
});

app.post("/room", middleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.json({ message: "Incorrect inputs" });
    }


    const userId = (req as any).userId;

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId
            }
        });

        res.json({
            roomId: room.id
        });
    } catch(e) {
        res.status(411).json({
            message: "Room already exists"
        })
    }
});

app.listen(3001, () => {
    console.log("Server running on port 3001");
});

app.get("/chats/:roomId", async (req, res) => {
    const roomId = Number(req.params.roomId);

    try {
        const messages = await prismaClient.chat.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                id: "desc" 
            },
            take: 50
        });


        res.json({
            messages: messages.reverse() 
        });
    } catch (e) {
        res.status(500).json({
            messages: []
        });
    }
});