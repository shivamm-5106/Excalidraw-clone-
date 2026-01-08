import express from 'express';
import jwt from 'jsonwebtoken';
import { middleware } from './middleware';
import {JWT_SECRET} from '@repo/backend-common/config'
import {CreateUserSchema,SignInSchema,CreateRoomSchema} from '@repo/common/types'

const app = express();

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
    const data = CreateUserSchema.safeParse(req.body);
    if(!data.success){
        return res.json({"message":"incorrect inputs"})
    }
    res.json({
        "data":data
    })
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