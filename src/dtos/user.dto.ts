import { UrlStatus } from "@prisma/client";

export interface UpdateStatusDTO{
    newStatus : UrlStatus
}

export interface UpdateUserNameDTO{
    newUserName : string
}

export interface UpdatePasswordDTO{
    currentPassword : string
    newPassword : string
}