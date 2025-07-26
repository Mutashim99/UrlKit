import bcrypt from "bcrypt";
import { prisma } from '../libs/prisma';
const register = async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    prisma.User.create();
};
