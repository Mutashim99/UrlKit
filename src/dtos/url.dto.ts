export interface NonCustomSlugShortenerDTO{
    originalUrl : string,
    expiresAt? : string | null,
}

export interface CustomSlugShortenerDTO {
    orignalUrl : string,
    customSlug : string,
    expiresAt? : string | null
}