import express from "express";
import "dotenv/config.js";
import cookieParser from "cookie-parser";
import {
  authenticate,
  optionalAuth,
} from "./middlewares/authenticate.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { authRouter } from "./routes/auth.route.js";
import { urlRouter } from "./routes/url.route.js";
import userRouter from "./routes/user.route.js";
import cors from "cors";
import { globalLimiter,authLimiter } from "./middlewares/ratelimiter.js";

import "./workers/email.worker.js"; // for worker to run //commenting this out cause ran out of free limits on upstash for redis cloud :(

const PORT = Number(process.env.PORT) || 8080;

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://www.urlkit.site",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(globalLimiter)

app.use("/api/auth",authLimiter, authRouter);
app.use("/api/url", optionalAuth, urlRouter);
app.use("/api/user", authenticate, userRouter);
app.use(errorHandler);
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
