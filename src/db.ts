
import mongoose from "mongoose";
import {model,Schema} from "mongoose";

const UserSchema = new Schema (
    {
        email:{type:String,unique:true},
        password:{type:String,require:true}
    }
)

export const UserModel= model("Users",UserSchema);

const ContentSchema = new Schema({
    title:{type:String,required:true},
    type:{type:String,required:true},
    link:{type:String,required:true},
    tags:[{type:mongoose.Types.ObjectId,ref:'tag'}],
    userId:{type:mongoose.Types.ObjectId,ref:'Users',required:true}
})

export const ContentModel= model("Contents",ContentSchema);

const LinkSchema = new Schema ({
    hash:String ,
    userId:{type:mongoose.Types.ObjectId,ref:'Users',required:true,unique:true}
})

export const LinkModel = model("link",LinkSchema);


