
import {z} from 'zod';
import { Request, Response, NextFunction } from 'express';
const required = z.object({
    email: z.string().email(),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" }),
  });
  
export const validate = (req:Request,res:Response, next:NextFunction)=>
{
  const parseData = required.safeParse(req.body);

  if(!parseData.success)
  {
    const errorMessages = parseData.error.issues.map((issue) => issue.message);
    res.status(411).json({
        mssg:errorMessages ,
         

    })
    return 
  }
  next();

}
