import { Router } from "express";
import { customShorten, expireUrl, nonCustomShorten, redirectToUrl } from '../controllers/url.controller.js';
export const urlRouter = Router();
urlRouter.post('/short', nonCustomShorten);
urlRouter.post('/short/custom', customShorten);
urlRouter.get('/:slug', redirectToUrl);
urlRouter.post('/expire', expireUrl);
