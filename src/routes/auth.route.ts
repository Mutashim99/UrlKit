import { Router } from "express";
import { login, register,resendToken, verifyEmailFromToken ,logout} from "../controllers/auth.controller.js";

export const authRouter = Router()

authRouter.post("/register",register)
authRouter.post("/login",login)
authRouter.post("/resend-email-token",resendToken)
authRouter.get("/verify-email",verifyEmailFromToken)
authRouter.post("/logout",logout)