import express, { NextFunction } from "express"
import jwt from "jsonwebtoken";
import { ContentModel, LinkModel, UserModel } from "./db";

import bcrypt from "bcrypt";
import { NextFunction as ExpressNextFunction, Request, Response } from 'express';
import { JWT_SECRET } from "./config";
import { userMiddleware } from "./middleware";
import { random } from "./utils";
import { validate } from "./userValidation";
import { contnetValidation } from "./contentValidation";
import cors from "cors";
const app = express();
app.use(express.json());
app.use(cors());
app.post('/api/v1/sign-up',validate ,async function(req,res)
{
    try{
        const email = req.body.email;
        const password = req.body.password;

        const existingUser =  await UserModel.findOne({
            email:email
        })
        if(existingUser)
        {
            res.status(400).json({
                mssg:"User already exist"
            })
            return;
        }
        const hashpassword = await bcrypt.hash(password,5);
        await UserModel.create({
            email:email,
            password:hashpassword 
        })
        res.status(200).json({
            mssg: "User created successfully",
          });
    }
    catch (err:any)
     {
        console.error("Error during user creation:", err);
        res.status(500).json({
          mssg: "Internal server error",
          error: err.message,
        });
      }
});
app.post('/api/v1/sign-in',async function(req,res)
{

    try{
        const email = req.body.email;
        const password = req.body.password;
        const existingUser:any = await UserModel.findOne({
            email:email
        })
        if(!existingUser )
        {
            res.status(401).json({
                mssg:"wrong email"
            })
            return;
        }
       const passwordmatch = await  bcrypt.compare(password,existingUser.password);
       if(!passwordmatch)
       {
        res.status(401).json({
            mssg:"wrong password"
        })
        return 
       }
         const token = jwt.sign({
            id:existingUser._id
         },JWT_SECRET);
         res.status(200).json({
            token:token
         })

    }
    catch (err: any) {
        console.error("Error during sign-in:", err);
        res.status(500).json({
          message: "Internal server error",
          error: err.message,
        });
      }
})

app.post('/api/v1/content',userMiddleware,contnetValidation,async function (req,res)
{
  try{
  const link = req.body.link;
  const type = req.body.type;
  await ContentModel.create({
    link:link,
    type:type,
    title:req.body.title,
    //@ts-ignore
    userId:req.userId,
    tag:[]
  })

  res.status(200).json({
    mssg:"content added"
  })

}catch (err:any)
     {
        console.error("Error during user creation:", err);
        res.status(500).json({
          mssg: "Internal server error",
          error: err.message,
        });
      }
    })
app.get('/api/v1/content', userMiddleware, async function (req, res) {
      try {
        // @ts-ignore
        const userId = req.userId;
    
        
        const content = await ContentModel.find({ userId }).populate("userId", "email");
    
        if (content.length > 0) {
          
          res.status(200).json({
           
            content
          });
          return
        } 
      } catch (error) {
      
        console.error(error);
        res.status(500).json({
          mssg: "An error occurred while retrieving content",
        });
      }
    });
    

app.delete('/api/v1/content',userMiddleware,async function (req,res)
{
  try {
    //@ts-ignore
    const userId = req.userId; 
    const contentId = req.query.id;
    console.log(contentId)

    if (!contentId) {
      res.status(400).json({
        mssg: "Content ID is required",
      });
      return; 
    }

    const result = await ContentModel.deleteOne({
      _id: contentId, 
           
    });

   
   console.log(result);
    res.status(200).json({
      mssg: "Content deleted successfully",
    });
    return; 
  } catch (err: any) {
    console.error("Error deleting content:", err);
    res.status(500).json({
      mssg: "Internal server error",
      error: err.message,
    });
  }
});


app.post("/api/v1/brain/share", userMiddleware, async function (req, res) 
{
  try {
    const share = req.body.share;
    if (typeof share !== "boolean") {
      res.status(400).json({ message: "Invalid share value" });
      return
    }
    //@ts-ignore
    const userId = req.userId;

    if (share) {
      
      const existingLink = await LinkModel.findOne({ userId });

      if (existingLink) {
      
        res.json({ hash: existingLink.hash });
        return;
      }

    const hash = random(10);

    if (share) {
      const link = await LinkModel.create(
        {
          //@ts-ignore
        userId: req.userId, 
        hash,
      });
      res.json({
       
        hash
      });
      return
    } 
    else {
          await LinkModel.deleteOne(
            {
              //@ts-ignore
               userId: req.userId 
            });
          res.json({
            message: "Link removed successfully",
          });
          return
    }
  } }catch (err) 
  {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



app.get('/api/v1/brain/:shareLink', async function (req, res) {
  const hash = req.params.shareLink;

  if (!hash) {
     res.status(400).json({ message: "Invalid or missing hash" });
     return
  }

  try {
    const link = await LinkModel.findOne({ hash });
    if (!link) {
     res.json({ message: "Wrong hash" });
     return
    }

    const content = await ContentModel.findOne({ userId: link.userId });
    const user = await UserModel.findOne({ _id: link.userId });

    if (!user) {
  res.json({ message: "User not found, something went wrong" });
    return
    }

    res.json({
      email: user.email ,
      content: content 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



app.listen(3000);