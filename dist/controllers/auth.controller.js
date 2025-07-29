import { generateToken } from "../utils/jwt.js";
import bcrypt from "bcrypt";
import { prisma } from '../libs/prisma.js';
import { tokenForEmail, verifyEmailToken } from "../utils/email.tokengeneration.js";
import { bodyForEmailVerification } from "../utils/email.templates.js";
import { sendMail } from "../utils/send.email.js";
// Register Controller
export const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return next({ status: 400, message: "User already registered" });
        }
        // Hash password and create new user
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword,
            },
        });
        const token = tokenForEmail({ userId: newUser.id });
        const verificationURL = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        const html = bodyForEmailVerification(verificationURL);
        const subject = "Please Verify your email!";
        const mailSendInfo = await sendMail({
            to: newUser.email,
            subject,
            html
        });
        res.status(201).send({
            message: `${newUser.name} registered successfully`,
            data: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
            },
            verificationEmailInfo: { sentTo: mailSendInfo.accepted[0] || null }
        });
    }
    catch (error) {
        next(error);
    }
};
// Login Controller
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const userFromDB = await prisma.user.findUnique({ where: { email } });
        if (!userFromDB) {
            return next({ status: 404, message: `User not found with email: ${email}` });
        }
        const isPassCorrect = await bcrypt.compare(password, userFromDB.passwordHash);
        if (!isPassCorrect) {
            return next({ status: 400, message: "Incorrect password" });
        }
        //generates a new token
        const token = generateToken({ userId: userFromDB.id });
        res.status(200).send({
            success: true,
            message: "Successfully logged in",
            token,
        });
    }
    catch (error) {
        next(error);
    }
};
//resend email verification link controller
export const resendToken = async (req, res, next) => {
    try {
        const email = req.body.email;
        const userFromDB = await prisma.user.findUnique({
            where: {
                email
            }
        });
        if (!userFromDB) {
            return next({ status: 404, message: "Cant find any registered user with the provided email" });
        }
        const token = tokenForEmail({ userId: userFromDB.id });
        const verificationURL = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        const html = bodyForEmailVerification(verificationURL);
        const subject = "Please Verify your email!";
        const mailSendInfo = await sendMail({
            to: userFromDB.email,
            subject,
            html
        });
        res.status(200).send({
            success: true,
            message: "Verification Link sent succesfully!",
            verificationEmailInfo: { sentTo: mailSendInfo.accepted[0] || null }
        });
    }
    catch (e) {
        next(e);
    }
};
//verify token controller 
export const verifyEmailFromToken = async (req, res, next) => {
    try {
        const token = req.query.token;
        if (!token) {
            return next({ status: 400, message: "token is required" });
        }
        const decode = verifyEmailToken(token);
        const userId = decode.userId;
        const userFromDB = await prisma.user.findUnique({
            where: { id: userId }
        });
        if (!userFromDB) {
            return next({ status: 404, message: "Invalid Token" });
        }
        if (userFromDB.isEmailVerified) {
            return next({ status: 200, message: "Email already verified" });
        }
        await prisma.user.update({
            where: { id: userId },
            data: { isEmailVerified: true }
        });
        res.status(200).send({ message: "Email Verified Succesfully" });
    }
    catch (err) {
        next(err);
    }
};
