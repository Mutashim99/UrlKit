import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import { optionalAuth } from './middlewares/authenticate.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { authRouter } from './routes/auth.route.js';
import { urlRouter } from './routes/url.route.js';
const PORT = process.env.PORT || 8080;
const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);
app.use('/api/url', optionalAuth, urlRouter);
app.use(errorHandler);
app.listen(PORT, () => {
    console.log(`running on ${PORT} `);
});
