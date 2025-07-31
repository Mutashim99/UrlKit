import { Worker } from "bullmq";
import IORedis from "ioredis";
import { sendMail } from "../utils/send.email.js";
import 'dotenv/config.js';
const redisURl = process.env.REDIS_URL;
redisURl ? console.log(redisURl) : console.log("cant get redis url");
const connection = new IORedis(redisURl, {
    maxRetriesPerRequest: null,
});
const worker = new Worker("emailQueue", async (job) => {
    const { to, subject, html } = job.data;
    console.log('Worker received job:', job.name, job.data);
    try {
        const result = await sendMail({ to, subject, html });
        console.log("Email sent:", result);
    }
    catch (error) {
        console.error("Error sending email:", error);
    }
}, { connection });
console.log("running the worker");
