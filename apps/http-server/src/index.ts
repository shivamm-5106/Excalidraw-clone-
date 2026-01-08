import express from 'express';
import jwt from 'jsonwebtoken';
import { middleware } from './middleware';

const app = express();

app.post("/signin",(req,res)=>{
    const userId = 1;
    jwt.sign({
        userId
    },"123123");
})

app.post("/signup",(req,res)=>{

})

app.post("/room",middleware,(req,res)=>{
    res.json({"roomId":123});

})

app.get("/",)

app.listen(3001);