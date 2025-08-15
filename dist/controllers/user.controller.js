import prisma from "../libs/prisma.js";
// get all the users created urls
export const getAllUrl = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const urls = await prisma.url.findMany({
            where: {
                userId,
            },
            include: {
                clicks: true,
            },
        });
        res.send(urls);
    }
    catch (e) {
        next(e);
    }
};
///get one url with url Id as query param
export const getSingleUrlDetails = async (req, res, next) => {
    try {
        const { urlId } = req.params;
        if (!urlId) {
            return next({ status: 400, message: "urlId is required" });
        }
        const userId = req.user?.userId;
        const urlFromDb = await prisma.url.findUnique({
            where: {
                id: urlId,
            },
            include: {
                clicks: true,
            },
        });
        if (urlFromDb?.userId !== userId) {
            return next({ status: 401, message: "unauthorized!" });
        }
        if (!urlFromDb) {
            return next({ status: 404, message: "No Url Found" });
        }
        res.status(200).send({
            success: true,
            message: "Succesfully fetched the url details",
            data: {
                ...urlFromDb,
            },
        });
    }
    catch (e) {
        next(e);
    }
};
// change the url status with url Id and patch rest verb
export const updateStatus = async (req, res, next) => {
    try {
        const urlId = req.params.urlId;
        const status = req.body.newStatus;
        if (!urlId) {
            return next({ status: 400, message: "urlId is required" });
        }
        const userId = req.user?.userId;
        const urlFromDb = await prisma.url.findUnique({
            where: {
                id: urlId,
            },
        });
        if (urlFromDb?.userId !== userId) {
            return next({ status: 401, message: "unauthorized!" });
        }
        const updatedUrl = await prisma.url.update({
            where: {
                id: urlId,
            },
            data: {
                status,
            },
        });
        res
            .status(200)
            .json({ success: true, message: "Status updated", data: updatedUrl });
    }
    catch (e) {
        next(e);
    }
};
// delete Url permanently
export const deleteUrl = async (req, res, next) => {
    try {
        const urlId = req.params.urlId;
        if (!urlId) {
            return next({ status: 400, message: "urlId is required" });
        }
        const userId = req.user?.userId;
        const urlFromDb = await prisma.url.findUnique({
            where: {
                id: urlId,
            },
        });
        if (urlFromDb?.userId !== userId) {
            return next({ status: 401, message: "unauthorized!" });
        }
        await prisma.click.deleteMany({
            where: {
                urlId,
            },
        });
        const urlFromDbToDelete = await prisma.url.delete({
            where: {
                id: urlId,
            },
        });
        res.status(200).json({
            success: true,
            message: "URL and its clicks deleted",
            data: urlFromDbToDelete,
        });
    }
    catch (e) {
        next(e);
    }
};
export const userInfo = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return next({ status: 401, message: "unauthorized!" });
        }
        const userFromDb = await prisma.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (userFromDb) {
            res.status(200).send({
                success: true,
                user: userFromDb,
                message: "succesfully fetched user Info",
            });
            return;
        }
        return next({ status: 400, message: "Cant find user" });
    }
    catch (e) {
        next(e);
    }
};
