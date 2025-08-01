import 'dotenv/config';
import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
export const sendMail = async (emailOptions) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            html: emailOptions.html,
            to: emailOptions.to,
            subject: emailOptions.subject
        });
        console.log(info);
        return info;
    }
    catch (e) {
        console.error("sendMail failed:", e);
        throw e;
    }
};
