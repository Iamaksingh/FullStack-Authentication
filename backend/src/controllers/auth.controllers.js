import User from '../models/user.schemas.js';
import {apiResponse} from '../utils/apiResponse.utils.js';
import {ApiError} from '../utils/apiError.utils.js';
import {asyncHandler} from '../utils/asyncHandler.utils.js';
import {emailVerificationMailGenContent, sendEmail , ResetPasswordMailGenContent} from '../utils/mailCreation.utils.js';
import {verifyJWT} from "../middleware/auth.middleware.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});  //Skip all schema validations and just save this document as it is why waste resources on validation
        return {accessToken,refreshToken};
    } catch (error) {
        throw new ApiError(500,"something went wrong while generating access token",[])
    }
}

const registerUser = asyncHandler(async(req,res)=>{
    const {email,username,password,role} = req.body; 
    const existingUser = await User.findOne({
        $or : [{username},{email}]
    });

    if (existingUser){
        throw new ApiError(409,"user with email or password already exist",[]);
    };

    const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false
    });

    const {unhashedToken,hashedToken,tokenExpiry} = user.generateTemporaryToken(); 
    
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({validateBeforeSave:false});

    const emailSent = await sendEmail({
        email: user?.email,
        subject: "please verify your email",
        mailgenContent: emailVerificationMailGenContent(
            user.username,
            `${FRONTEND_URL}/verify-email/${unhashedToken}`
        )
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");
    if (!createdUser){
        throw new ApiError(500,"something went wrong while registering the user");
    }

    return res.status(201).json(new apiResponse(201,{user:createdUser,emailSent}, emailSent ? "User registered. Verification email sent" : "User registered. Failed to send verification email",[]));
})

const loginUser = asyncHandler(async(req,res)=>{
    const {email,password,username} = req.body;
    if ( !email ){
        throw new ApiError(400,"provide email");
    }
    const user = await User.findOne({email})

    if (!user){
        throw new ApiError(400,"user does not exist");
    }

    if ( !(await user.verifyPassword(password)) ) {
        throw new ApiError(400,"wrong password");
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id);    
    const loggedUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");
    
    const options= {
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }

    return res
      .status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",refreshToken,options)
      .json(new apiResponse(200,{loggedUser , refreshToken , accessToken },"User logged in successfully"));

})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate( req.user._id, {$set: {refreshToken:""}}, {new:true} );
    const options = {
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }
    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new apiResponse(200,{},"user logged out successfully"));
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(new apiResponse(200,req.user,"current user fetched successfully"));
})

const verifyEmail = asyncHandler(async(req,res)=>{
    const {verificationToken} = req.params;
    if (!verificationToken){
        throw new ApiError(400,"email verification token is missing");
    }
    let hashedToken=crypto.createHash("sha256").update(verificationToken).digest("hex");
    const user = await User.findOne({emailVerificationToken:hashedToken,emailVerificationExpiry:{$gt: Date.now()}});
    if (!user) {
        const alreadyVerifiedUser = await User.findOne({ isEmailVerified: true });
        if (alreadyVerifiedUser) {
            return res.status(200).json({ success: true, message: "Email already verified ✅" });
        }
        throw new ApiError(400, "email verification token is invalid or expired");
    }
    user.emailVerificationToken=undefined;
    user.emailVerificationExpiry=undefined;
    user.isEmailVerified=true;
    await user.save({validateBeforeSave:false});
    return res.status(200).json({ success: true, message: "Email verified successfully ✅" });
})

const resendVerificationEmail = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user._id);
    if (!user){
        throw new ApiError(404,"user does not exist");
    }
    if (user.isEmailVerified){
        throw new ApiError(409,"email is already verified");
    }

    const {unhashedToken,hashedToken,tokenExpiry} = user.generateTemporaryToken(); 
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    await user.save({validateBeforeSave:false});
    const emailSent = await sendEmail({
        email: user?.email,
        subject: "please verify your email",
        mailgenContent: emailVerificationMailGenContent(
            user.username,
            `${FRONTEND_URL}/verify-email/${unhashedToken}`
        )
    });

    return res.status(200).json(new apiResponse(200,{emailSent}, emailSent ? "Mail has been sent again" : "Failed to send mail"));
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken){
        throw new ApiError(401,"unauthorized access");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET); 
        const user = await User.findById(decodedToken?._id);
        if (!user){
            throw new ApiError(401,"invalid refresh token");
        }
        if ( incomingRefreshToken!==user?.refreshToken ){
            throw new ApiError(401,"Refresh token expired");
        }
        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        }
        const {accessToken,refreshToken:newRefreshToken} =await generateAccessAndRefreshTokens(user._id);
        user.refreshToken=newRefreshToken;
        await user.save({validateBeforeSave:false});

        return res.status(200)
            .cookie("accessToken",accessToken,options)
            .cookie("refreshToken",newRefreshToken,options) 
            .json(new apiResponse(200,{accessToken, refreshToken:newRefreshToken},"successfully generated new tokens"))

    } catch (error) {
        throw new ApiError(401,"invalid refresh token");
    }
})

//when user logged in
const resetPassword = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user._id);
    if ( !user ){
        throw new ApiError(404,"user does not exist");
    }
    const {oldPassword,newPassword} = req.body;
    const isValidPassword = await user.verifyPassword(oldPassword);
    if ( !isValidPassword ){
        throw new ApiError(404,"wrong older password");
    }
    user.password=newPassword;
    user.save({validateBeforeSave:false});
    
    return res.status(200).json(new apiResponse(200,{},"password changed successfully"));
})

//user will be sent an email with this token
const forgotPasswordRequest = asyncHandler(async(req,res)=>{
    const {email} = req.body;
    const user = await User.findOne({email}); 
    if (!user){
        throw new ApiError(400,"user does not exist");
    }
    const {unhashedToken,hashedToken,tokenExpiry} = user.generateTemporaryToken();
    user.forgotPasswordToken=hashedToken;
    user.forgotPasswordExpiry=tokenExpiry;
    await user.save({validateBeforeSave:false})

    const emailSent = await sendEmail({
        email: user?.email,
        subject: "password reset request",
        mailgenContent: ResetPasswordMailGenContent(
            user.username,
            `${FRONTEND_URL}/forgot-password/${unhashedToken}`
        )
    });

    return res.status(200).json( new apiResponse(200,{emailSent}, emailSent ? "Password reset mail has been sent on email" : "Failed to send password reset email") );
})
//email redirects to this page
const resetForgotPassword = asyncHandler(async(req,res)=>{
    const {resetToken} = req.params;
    const {newPassword} = req.body;
    let hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const user = await User.findOne({ forgotPasswordToken:hashedToken,forgotPasswordExpiry:{$gt:Date.now()} });
    if (!user){
        throw new ApiError(400,"Token is invalid or expired");
    }
    user.forgotPasswordExpiry=undefined;
    user.forgotPasswordToken=undefined;
    user.password=newPassword;
    await user.save({validateBeforeSave:false});
    return res.status(200).json(new apiResponse(200,{},"password reset successfull"));
})

export {registerUser,loginUser,logoutUser,getCurrentUser,verifyEmail,refreshAccessToken,forgotPasswordRequest,resetForgotPassword,resetPassword,resendVerificationEmail};