import { NextFunction, Request, Response } from "express";
import prisma from "../libs/prisma.js";
import {
  UpdateStatusDTO,
  UpdateUserNameDTO,
  UpdatePasswordDTO,
} from "../dtos/user.dto.js";
import bcrypt from "bcrypt";

// get all the users created urls
export const getAllUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next({ status: 401, message: "UnAuthorized" });
    }
    const urls = await prisma.url.findMany({
      where: {
        userId,
      },
      include: {
        clicks: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.send(urls);
  } catch (e) {
    next(e);
  }
};
///get one url with url Id as query param
export const getSingleUrlDetails = async (
  req: Request<{ urlId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
      urlFromDb,
    });
  } catch (e) {
    next(e);
  }
};

// change the url status with url Id and patch rest verb
export const updateStatus = async (
  req: Request<{ urlId: string }, {}, UpdateStatusDTO>,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
  } catch (e) {
    next(e);
  }
};

// delete Url permanently
export const deleteUrl = async (
  req: Request<{ urlId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
  } catch (e) {
    next(e);
  }
};

export const userInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
      res.setHeader("Cache-Control", "no-store");
      res.status(200).send({
        success: true,
        user: userFromDb,
        message: "succesfully fetched user Info",
      });
      return;
    }

    return next({ status: 400, message: "Cant find user" });
  } catch (e) {
    next(e);
  }
};

export const updateUserName = async (
  req: Request<{}, {}, UpdateUserNameDTO>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { newUserName } = req.body;
    if (!userId) {
      return next({ status: 401, message: "unAuthorized" });
    }
    if (!newUserName) {
      return next({
        status: 400,
        message: "New username is required to update!",
      });
    }
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: newUserName,
      },
      select: { id: true, name: true, email: true },
    });

    res.status(200).json({
      success: true,
      message: "Username updated successfully",
      user: updatedUser,
    });
  } catch (e) {
    next(e);
  }
};

export const updatePassword = async (
  req: Request<{}, {}, UpdatePasswordDTO>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { newPassword, currentPassword } = req.body;
    if (!userId) {
      return next({ status: 401, message: "Unauthorized" });
    }

    if (!newPassword || !currentPassword) {
      return next({
        status: 400,
        message: "Both current and new password are required",
      });
    }
    const currentUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!currentUser) {
      return next({ status: 404, message: "User not found" });
    }
    const checkOldPassword = await bcrypt.compare(
      currentPassword,
      currentUser?.passwordHash!
    );
    if (!checkOldPassword) {
      res
        .status(400)
        .send({ succes: false, message: "current password does not match" });
      return;
    }
    if (newPassword.length < 8) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
      return;
    }
    const newPasswordHashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        passwordHash: newPasswordHashed,
      },
    });

    res.status(200).send({
      success: true,
      message: "succesfully upadted password",
    });
  } catch (e) {
    next(e);
  }
};

export const deleteUserAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return next({ status: 401, message: "Unauthorized" });
    }
    await prisma.user.delete({
      where: {
        id: userId,
      },
    });
    res.status(200).send({success : true,message:"Successfully deleted users account"})
  } catch (e) {
    next(e);
  }
};
