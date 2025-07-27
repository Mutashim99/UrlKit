import jwt from 'jsonwebtoken'
import { JWTPayloadforUserId } from '../types/jwt.type'


const EMAIL_SECRET = process.env.EMAIL_SECRET!

export const tokenForEmail = (payload : JWTPayloadforUserId) : string =>{
    const token = jwt.sign(payload,EMAIL_SECRET,{expiresIn:'15m'})
    return token;
}

export const verifyEmailToken = (token : string) : JWTPayloadforUserId =>{
        return jwt.verify(token,EMAIL_SECRET) as JWTPayloadforUserId
}
