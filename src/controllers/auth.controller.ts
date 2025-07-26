import { generateToken } from "../utils/jwt";
import { NextFunction, Request, Response } from "express";
import { LoginUserDTO, RegisterUserDTO } from "../dtos/auth.dto";
import bcrypt from "bcrypt";
import { prisma } from "../libs/prisma";

// Register Controller
export const register = async (
  req: Request<{}, {}, RegisterUserDTO>,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

    res.status(201).send({
      message: `${newUser.name} registered successfully`,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login Controller
export const login = async (
  req: Request<{}, {}, LoginUserDTO>,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

    const token = generateToken({ userId: userFromDB.id });

    res.status(200).send({
      success: true,
      message: "Successfully logged in",
      token,
    });
  } catch (error) {
    next(error);
  }
};
