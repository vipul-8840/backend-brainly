
import {z} from "zod";
import { Request, Response, NextFunction } from 'express';
export const required= z.object({
    link: z.string().url({ message: "Invalid URL format" }),
    title: z.string().min(1, { message: "Title is required" }),
  
  });
  
  export const contnetValidation = (req:Request,res:Response, next:NextFunction)=>
  {
    const parseData = required.safeParse(req.body);
    if(!parseData.success)
        {
          const errorMessages = parseData.error.issues.map((issue) => issue.message);
          res.status(411).json({
              mssg:errorMessages,
               
      
          })
          return 
        }
        next();
  }