import { Router } from "express";
import { customShorten, expireUrl, nonCustomShorten, redirectToUrl } from '../controllers/url.controller.js';
import { checkUrlSafety } from "../controllers/geminiurlcheck.controller.js";
export const urlRouter = Router();
urlRouter.post('/short', nonCustomShorten);
urlRouter.post('/short/custom', customShorten);
urlRouter.get('/:slug', redirectToUrl);
urlRouter.post('/expire', expireUrl);
urlRouter.post('/check-url-safety', checkUrlSafety);
