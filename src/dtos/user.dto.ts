import { UrlStatus } from "@prisma/client";

export interface UpdateStatusDTO{
    newStatus : UrlStatus
}