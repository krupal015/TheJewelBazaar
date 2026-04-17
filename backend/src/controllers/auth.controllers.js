import { User } from "../models/user.models.js"
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-errors.js";
import { asyncHandler } from "../utils/async_handler.js";
import { sendEmail, emailVerificationMailgenContent } from "../utils/mail.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)

        console.log("USER:", user);

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken };

    } catch (error) {
        console.log(error);
        throw new ApiError(500, "something went wrong while generating access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password, role } = req.body;

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existingUser) {
        throw new ApiError(409, "user with this email already exist", [])

    }

    const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false,
    })

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false })

    await sendEmail(
        {
            email: user?.email,
            subject: "please verify your email",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
            )
        }
    )

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    )

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering user")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                { user: createdUser },
                "user registered succesfully and verification email has been sent",
            )
        )
})

const login = asyncHandler(async (req, res) => {
    const { email, password, username } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(400, "user does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid Credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)


    const loggedIndUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).json({
        success: true,
        message: "User logged in successfully",
        user: loggedIndUser,
        accessToken,
        refreshToken
    });

})

const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: "",
            }
        },
        {
            new: true,
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "user loggeed out")
        )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "curret user fetched succesfully"
            )
        )
})

const verifyEmail = asyncHandler(async (req, res) => {
    const { verificationToken } = req.params;

    if (!verificationToken) {
        throw new ApiError(400, "Email verification token is missing")
    }
    let hashedToken = crypto
        .createHash("sha256")
        .update("verificationToken")
        .digest("hex")

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: { $gt: Date.now() }
    })

    if (!user) {
        throw new ApiError(400, "Token is invalid or expired")
    }

    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    user.isEmailVerified = true
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(new ApiResponse(200, { isEmailVerified: true },
        "Email is verified"
    ))
})

const resendEmailverification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id);

    if (!user) {
        throw new ApiError(404, "user does not exist")
    }

    if (user.isEmailVerified) {
        throw new ApiError(409, "Email is already verified")
    }

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();


    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false })

    await sendEmail(
        {
            email: user?.email,
            subject: "please verify your email",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
            )
        }
    )
    return res.status(200).json(new ApiResponse(200, {},
        "Email has been sent to your email id"
    ))
})

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized access")
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh tokenn")
        }
        if (incomingRefreshToken !== user?.refreshToken) {
           c
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken: newrefreshToken } = await generateAccessAndRefreshToken(user._id);;

        user.refreshToken = newrefreshToken;
        await user.save()

        return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options)
        .json(new ApiResponse(200, { accessToken,refreshToken:newrefreshToken },
            "Access Token refreshed"
        ))

    } catch (error) { 
         throw new ApiError(401, "Invalid refresh tokenn")
    }
})

const resetForgotPassword = asyncHandler (async(req,res) => {
    
})

const forgotPasswordRequest = asyncHandler (async(req,res) => {
    const {email} = req.body ;
    const user = await User.findOne({email})

        if (!user) {
            throw new ApiError(401, "user does not exist")
        }

   const {unHashedToken, hashedToken,tokenExpiry}=  user.generateTemporaryToken()

   user.forgotPasswordToken = hashedToken
   user.forgetPasswordExpiry = tokenExpiry

   await user.save({validateBeforeSave :false})

   await sendEmail(
    {
            email: user?.email,
            subject: "password reset reqUEST...",
            mailgenContent: forgotPasswordMailgenContent(
                user.username,
                `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`
            )
        }
   )
   return res.status(200).json(200,{},"password reset mail has been sent on your email")
})

const changeCurrentPassword = asyncHandler (async(req,res) => {
const{oldPassword,newPassword} = req.body
const user = await User.findById(req.user?._id);

const isPasswordValid = await user.isPasswordCorrect(oldPassword)
 if (!isPasswordValid) {
            throw new ApiError(401, "Invalid Old Password")
        }

        user.password = newPassword
        await user.save({validateBeforeSave:false})
 return res.status(200).json(200,{},"password changed successfully")
})

 
export { registerUser,
     login,
      logoutUser,
       getCurrentUser, 
       verifyEmail, 
       resendEmailverification ,
       forgotPasswordRequest,
       changeCurrentPassword,
       refreshAccessToken};

