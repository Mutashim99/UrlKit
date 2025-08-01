import { NextFunction, Request, Response } from "express";
import { CustomSlugShortenerDTO, NonCustomSlugShortenerDTO } from "../dtos/url.dto.js";
import { generateUniqueSlug } from "../utils/randomslug.js";
import  prisma  from "../libs/prisma.js";
import axios from 'axios'
// url shortener controller for non custom slug POST /api/shorten
export const nonCustomShorten = async (req:Request<{},{},NonCustomSlugShortenerDTO>,res:Response,next:NextFunction) : Promise<void> =>{
    try{
    const {originalUrl,expiresAt} = req.body
        if(!originalUrl){
            return next({status : 400,message : "Url is required"})
        }
    const expiresAtDate = expiresAt ? new Date(expiresAt) : null;
    const userId = req.user?.userId
   const randomSlug =  await generateUniqueSlug(prisma)
   if(!randomSlug){
   return next({status : 400,message:"can not generate the random string retry again"})
   }
   const created = await  prisma.url.create({
    data: {
        orignalUrl : originalUrl,
        expiresAt : expiresAtDate,
        shortSlug : randomSlug,
        userId : userId,
        
    }
   })
   res.status(201).send({
    success : true,
    message:"succesfully created the random short url",
    data : {
        shortenUrl : `${process.env.FRONTEND_URL}/${created.shortSlug}`
    }
   })
   
    }catch(err){
        next()
    }
}

export const customShorten = async(req:Request<{},{},CustomSlugShortenerDTO>,res:Response,next:NextFunction) : Promise<void>=>{
    try{
        const {orignalUrl,expiresAt,customSlug} = req.body
        if(!orignalUrl){
            return next({status : 400,message : "Url is required"})
        }
        
        const isSlugAvailable = await prisma.url.findUnique({
            where:{
                shortSlug : customSlug
            }
        })
        const expiresAtDate = expiresAt ? new Date(expiresAt) : null;
        const userId = req.user?.userId
        if(!userId || userId === undefined){
           return  next({status : 401 , message : "Unauthorize, User must be logged in to create custom urls"} )
        }
        if(isSlugAvailable){
            return next({status:400,message:"This Custom Slug is Taken try another one"})
        }
        const newCustomShortUrl = await prisma.url.create({
            data : {
                orignalUrl : orignalUrl,
                shortSlug : customSlug,
                userId : userId,
                isCustom : true,
                expiresAt : expiresAtDate
            }
        })
        res.status(201).send({
            success : true,
            message: 'Custom short URL created successfully',
            data : {
                shortenUrl : `${process.env.FRONTEND_URL}/${newCustomShortUrl.shortSlug}`
            }
        })
    }catch(err){
        next(err)
    }
}

export const redirectToUrl = async (req:Request,res:Response,next:NextFunction) :Promise<void> =>{
    try{
        const {slug} = req.params

    const originalUrlFromDB = await prisma.url.findUnique({
        where : {
            shortSlug: slug,
            
        }
    })
    

    if(!originalUrlFromDB){
       return next({status : 404,message : "cant find the URL with the given slug provided"})
    }
      if (originalUrlFromDB.status !== 'ACTIVE') {
      return next({
        status: 403,
        message: `URL is ${originalUrlFromDB.status.toLowerCase()}`,
      });
    }
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;

    // GeoIP Lookup
    let country = null;
    let city = null;
    try {
      const geoRes = await axios.get(`https://ipapi.co/${ip}/json/`);
      country = geoRes.data.country_name || null;
      city = geoRes.data.city || null;
    } catch (geoErr) {
      next({status:404,message:"Error occured when fetching api details"})
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

    res.redirect(301,originalUrlFromDB.orignalUrl)
    }catch(err){
        next(err)
    }
}
// this endpoing will be invoked by the azure function after every hour or we can change that to be like 30 mins, for cron job
export const expireUrl = async (req:Request,res:Response,next:NextFunction) : Promise<void> =>{
    const now = new Date()
    const findExpiredAndUpdate = await prisma.url.updateMany({
        where:{
            expiresAt : {
                lt : now
            },
        status : "ACTIVE"
        },
        data : {
            status : "EXPIRED"
        }
    })
    res.status(200).send({
        success : true,
        updateCount : findExpiredAndUpdate.count,
    })
}