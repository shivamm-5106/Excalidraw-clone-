import express from 'express';
import jwt from 'jsonwebtoken';
import { middleware } from './middleware';
import { JWT_SECRET } from '@repo/backend-common/config'
import { CreateUserSchema, SignInSchema, CreateRoomSchema } from '@repo/common/types'
import { prismaClient } from "@repo/db/client"




const app = express();
app.use(express.json());
// async function main() {
//     await prismaClient.$connect();
//     console.log(" Prisma connected");
// }

// main().catch((e) => {
//     console.error(" Prisma connection error: ", e);
//     process.exit(1);
// });


app.post("/signin", (req, res) => {
    const data = SignInSchema.safeParse(req.body);
    if (!data.success) {
        return res.json({ "message": "incorrect inputs" })
    }
    const userId = 1;
    jwt.sign({
        userId
    }, JWT_SECRET);
})

app.post("/signup", async (req, res) => {
    const parsedData = CreateUserSchema.safeParse(req.body);

    if (!parsedData.success) {
        return res.status(400).json({ message: "incorrect inputs" });
    }

    try {
        await prismaClient.$connect();
        const user = await prismaClient.user.create({
            data: {
                username: parsedData.data.username,
                password: parsedData.data.password,
                name: parsedData.data.name,
            },
        });

        return res.json({
            data: user,
        });
    } catch (error) {
        console.error(error);
        return res.status(409).json({
            message: "user already exists",
        });
    }
});


app.post("/room", middleware, (req, res) => {
    const data = CreateRoomSchema.safeParse(req.body);
    if (!data.success) {
        return res.json({ "message": "incorrect inputs" })
    }
    res.json({ "roomId": 123 });

})

app.get("/",)

app.listen(3001);