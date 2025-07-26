import { generateToken,verifyToken } from "../utils/jwt";
import { Request,Response } from "express";
import { RegisterUserDTO } from "../dtos/auth.dto";
import bcrypt from "bcrypt";
import {prisma} from '../libs/prisma'


const register = async (req : Request<{},{},RegisterUserDTO>,res:Response) : Promise<void> =>{
    const {name ,email,password} = req.body;

    const hashedPassword = await bcrypt.hash(password,10)
    
    prisma.User.create()



} 