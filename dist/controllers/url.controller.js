import { generateUniqueSlug } from "../utils/randomslug.js";
import prisma from "../libs/prisma.js";
import axios from "axios";
import { load } from "cheerio";
// url shortener controller for non custom slug POST /api/shorten
export const nonCustomShorten = async (req, res, next) => {
    try {
        const { expiresAt } = req.body;
        let { originalUrl } = req.body;
        if (!originalUrl) {
            return next({ status: 400, message: "Url is required" });
        }
        if (!/^https?:\/\//i.test(originalUrl)) {
            originalUrl = `http://${originalUrl}`; // default to http if no protocol
        }
        const expiresAtDate = expiresAt ? new Date(expiresAt) : null;
        const userId = req.user?.userId;
        const randomSlug = await generateUniqueSlug(prisma);
        if (!randomSlug) {
            return next({
                status: 400,
                message: "can not generate the random string retry again",
            });
        }
        const created = await prisma.url.create({
            data: {
                orignalUrl: originalUrl,
                expiresAt: expiresAtDate,
                shortSlug: randomSlug,
                userId: userId,
            },
        });
        res.status(201).send({
            success: true,
            message: "succesfully created the random short url",
            slug: randomSlug,
            shortenUrl: `${process.env.FRONTEND_URL}/${created.shortSlug}`,
        });
    }
    catch (err) {
        next();
    }
};
export const customShorten = async (req, res, next) => {
    try {
        const { expiresAt, customSlug } = req.body;
        let { originalUrl } = req.body;
        if (!originalUrl) {
            return next({ status: 400, message: "Url is required" });
        }
        if (!/^https?:\/\//i.test(originalUrl)) {
            originalUrl = `http://${originalUrl}`; // default to http if no protocol
        }
        const isSlugAvailable = await prisma.url.findUnique({
            where: {
                shortSlug: customSlug,
            },
        });
        const expiresAtDate = expiresAt ? new Date(expiresAt) : null;
        const userId = req.user?.userId;
        // if (!userId || userId === undefined) {
        //   return next({
        //     status: 401,
        //     message: "Unauthorize, User must be logged in to create custom urls",
        //   });
        // }
        if (isSlugAvailable) {
            return next({
                status: 400,
                message: "This Custom Slug is Taken try another one",
            });
        }
        const newCustomShortUrl = await prisma.url.create({
            data: {
                orignalUrl: originalUrl,
                shortSlug: customSlug,
                userId: userId,
                isCustom: true,
                expiresAt: expiresAtDate,
            },
        });
        res.status(201).send({
            success: true,
            message: "Custom short URL created successfully",
            shortenUrl: `${process.env.FRONTEND_URL}/${newCustomShortUrl.shortSlug}`,
            slug: customSlug,
        });
    }
    catch (err) {
        next(err);
    }
};
export const redirectToUrl = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const originalUrlFromDB = await prisma.url.findUnique({
            where: {
                shortSlug: slug,
            },
        });
        if (!originalUrlFromDB) {
            return next({
                status: 404,
                message: "cant find the URL with the given slug provided",
            });
        }
        if (originalUrlFromDB.status !== "ACTIVE") {
            return next({
                status: 403,
                message: `URL is ${originalUrlFromDB.status.toLowerCase()}`,
            });
        }
        const ip = req.headers["x-forwarded-for"]?.split(",")[0] ||
            req.socket.remoteAddress ||
            null;
        const userAgent = req.headers["user-agent"] || null;
        // GeoIP Lookup
        let country = null;
        let city = null;
        try {
            const geoRes = await axios.get(`https://ipapi.co/${ip}/json/`);
            country = geoRes.data.country_name || null;
            city = geoRes.data.city || null;
        }
        catch (geoErr) {
            next({ status: 404, message: "Error occured when fetching api details" });
        }
        await prisma.url.update({
            where: { shortSlug: slug },
            data: {
                clickCount: {
                    increment: 1,
                },
            },
        });
        await prisma.click.create({
            data: {
                urlId: originalUrlFromDB.id,
                ip,
                userAgent,
                country,
                city,
            },
        });
        if (req.query.preview === "true") {
            res.json({ originalUrl: originalUrlFromDB.orignalUrl });
            return;
        }
        res.redirect(301, originalUrlFromDB.orignalUrl);
    }
    catch (err) {
        next(err);
    }
};
export const findBySlug = async (req, res, next) => {
    try {
        const slugs = req.body.slugs;
        const urlsForLocalHistory = await prisma.url.findMany({
            where: {
                shortSlug: {
                    in: slugs,
                },
            },
            include: {
                clicks: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.status(200).send(urlsForLocalHistory);
    }
    catch (e) {
        next(e);
    }
};
// this endpoing will be invoked by the azure function after every hour or we can change that to be like 30 mins, for cron job
export const expireUrl = async (req, res, next) => {
    const now = new Date();
    const findExpiredAndUpdate = await prisma.url.updateMany({
        where: {
            expiresAt: {
                lt: now,
            },
            status: "ACTIVE",
        },
        data: {
            status: "EXPIRED",
        },
    });
    res.status(200).send({
        success: true,
        updateCount: findExpiredAndUpdate.count,
    });
};
export const getPreview = async (req, res, next) => {
    const { url } = req.body;
    if (!url) {
        // FIX: Changed to 400 (Bad Request) which is more appropriate
        return next({ status: 400, message: "URL is required" });
    }
    try {
        // 1. Fetch the HTML of the target URL
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        // 2. Load the HTML into cheerio
        const $ = load(data); // FIX: Use the imported 'load' function
        // 3. Find the preview image
        //    We check for 'og:image' first, then 'twitter:image' as a fallback.
        let imageUrl = $("meta[property=\"og:image\"]").attr("content");
        if (!imageUrl) {
            imageUrl = $("meta[name=\"twitter:image\"]").attr("content");
        }
        // 4. Send the result
        if (imageUrl) {
            // Sometimes the URL is relative (e.g., /images/logo.png)
            // This simple check helps fix that.
            const finalUrl = new URL(imageUrl, url).href;
            // Use return to stop execution after sending response
            res.json({ imageUrl: finalUrl });
            return;
        }
        else {
            // Use return to stop execution after sending response
            res.status(404).json({ message: "No preview image found" });
            return;
        }
    }
    catch (error) {
        console.error("Failed to fetch preview:", error.message);
        // Use return to stop execution after sending response
        res.status(500).json({ message: "Failed to fetch preview" });
        return;
    }
};
