import jwt from 'jsonwebtoken';
const EMAIL_SECRET = process.env.EMAIL_SECRET;
export const tokenForEmail = (payload) => {
    const token = jwt.sign(payload, EMAIL_SECRET, { expiresIn: '15m' });
    return token;
};
export const verifyEmailToken = (token) => {
    return jwt.verify(token, EMAIL_SECRET);
};
