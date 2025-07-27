import nodemailer from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { sendEmailOption } from '../types/email.options'



const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
} as SMTPTransport.Options) 

export const sendMail = async(emailOptions : sendEmailOption) : Promise<SMTPTransport.SentMessageInfo> => {
    const info = await transporter.sendMail({
        from : process.env.EMAIL_FROM,
        html : emailOptions.html,
        to : emailOptions.to,
        subject : emailOptions.subject
    })
    console.log(info);
    return info
}