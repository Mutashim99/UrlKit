import { JWTPayloadforUserId } from '../types/jwt.type';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;


export const generateToken =  (payload: JWTPayloadforUserId) : string => {
  const token:string = jwt.sign(payload, JWT_SECRET, {expiresIn: '1d',});
  return token;
};


export const verifyToken = (token : string) : JWTPayloadforUserId =>  {
  try{  
    return jwt.verify(token,JWT_SECRET) as JWTPayloadforUserId
  }catch(e){
    throw new Error("Invalid token");
  }
}