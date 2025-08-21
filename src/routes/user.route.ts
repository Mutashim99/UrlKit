import { Router } from "express";
import {
  getAllUrl,
  getSingleUrlDetails,
  updateStatus,
  deleteUrl,
  userInfo,
  updateUserName,
  updatePassword,
  deleteUserAccount
} from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.get("/dashboard/urls", getAllUrl);
userRouter.get("/dashboard/url/:urlId", getSingleUrlDetails);
userRouter.patch("/dashboard/url/:urlId", updateStatus);
userRouter.delete("/dashboard/url/:urlId", deleteUrl);
userRouter.get("/dashboard/me", userInfo);
userRouter.patch("/dashboard/me/username",updateUserName)
userRouter.patch("/dashboard/me/password",updatePassword)
userRouter.delete("/dashboard/me/",deleteUserAccount)

export default userRouter;
