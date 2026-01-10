import express from 'express';
import jwt from 'jsonwebtoken';
import { middleware } from './middleware';
import {JWT_SECRET} from '@repo/backend-common/config'
import {CreateUserSchema,SignInSchema,CreateRoomSchema} from '@repo/common/types'
import {prismaClient } from "@repo/db/client"

const app = express();
app.use(express.json());

app.post("/signin",(req,res)=>{
    const data = SignInSchema.safeParse(req.body);
    if(!data.success){
        return res.json({"message":"incorrect inputs"})
    }
    const userId = 1;
    jwt.sign({
        userId
    },JWT_SECRET);
})

app.post("/signup",(req,res)=>{
    const parsedData = CreateUserSchema.safeParse(req.body);
    if(!parsedData.success){
        return res.json({"message":"incorrect inputs"})
    }
    try {
        prismaClient.user.create({
            data:{
                username:parsedData?.data.username,
                password:parsedData?.data.password,
                name:parsedData?.data.name,
            }
        })
        res.json({
            "data":parsedData.data
        })
        
    } catch (error) {
        console.log(error);
        res.json({"message":"user already exists"})
    }
})

app.post("/room",middleware,(req,res)=>{
    const data = CreateRoomSchema.safeParse(req.body);
    if(!data.success){
        return res.json({"message":"incorrect inputs"})
    }
    res.json({"roomId":123});

})

app.get("/",)

app.listen(3001);