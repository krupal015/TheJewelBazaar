import mongoose , {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import crypto from "crypto";
import { stringify } from "querystring";


const userSchema = new Schema({

    username:{
        type:String,
        required:true,
        trim:true,
    },
    password:{
        type:String,
        required:[true,"password is required"],
        unique:true,
        trim:true,
    },
    email:{
        type:String,
        require:true,
        unique:true,
        trim:true,
    },
    fullName:{
         type:String,
        require:true,
        trim:true,
    },
    refreshToken: {
        type:String
    },
    forgotPasswordToken:{
        type:String,

    },
    forgetPasswordExpiry:{
        type:Date
    },
    emailVerificationToken:{
        type:String
    },
    emailVerificationExpiry:{
        type:String
    },
    isEmailVerified :{
        type:String,
        default:false
    },
},
{
    timestamps:true,
},
);

userSchema.pre("save", async function(){
    if(!this.isModified("password")) return ;
   this.password =  await bcrypt.hash(this.password,10);
    // next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function(){
   return jwt.sign(
        {
            _id : this._id,
            email:this.email,
            username:this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
    )
}

userSchema.methods.generateRefreshToken = function(){
     return jwt.sign(
        {
            _id : this._id,
            email:this.email,
            username:this.username
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
    )
}

userSchema.methods.generateTemporaryToken = function(){
    const unHashedToken = crypto
                                .randomBytes(20)
                                 .toString("hex");

    const hashedToken = crypto.createHash("sha256").update("unHashedToken").digest("hex")

    const tokenExpiry = Date.now() + (20* 60 * 1000); //20min

    return {unHashedToken, hashedToken,tokenExpiry}
}

export const User = mongoose.model("User",userSchema)
