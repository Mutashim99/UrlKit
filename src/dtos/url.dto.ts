export interface NonCustomSlugShortenerDTO{
    originalUrl : string,
    expiresAt? : string | null,
}

export interface CustomSlugShortenerDTO {
    originalUrl : string,
    customSlug : string,
    expiresAt? : string | null
}