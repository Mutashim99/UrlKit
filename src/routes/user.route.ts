import { Router } from "express";
import { getAllUrl , getSingleUrlDetails  , updateStatus,deleteUrl } from "../controllers/user.controller.js";

const userRouter = Router()

userRouter.get('/dashboard/urls', getAllUrl)
userRouter.get('/dashboard/url/:urlId', getSingleUrlDetails)
userRouter.patch('/dashboard/url/:urlId', updateStatus)
userRouter.delete('/dashboard/url/:urlId', deleteUrl)





export default userRouter