import express from 'express';
import 'dotenv/config.js';
import { authenticate, optionalAuth } from './middlewares/authenticate.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { authRouter } from './routes/auth.route.js';
import { urlRouter } from './routes/url.route.js';
import userRouter from './routes/user.route.js';
import './workers/email.worker.js'; // for worker to run //commenting this out cause ran out of free limits on upstash for redis cloud :(
const PORT = process.env.PORT || 8080;
const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);
app.use('/api/url', optionalAuth, urlRouter);
app.use('/api/user', authenticate, userRouter);
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`running on ${PORT} `);
});
