import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt  from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    avatar: {
      type: {
        url: String,
        localPath: String,
      },
      default: {
        url: `https://placehold.co/200x200`,
        localPath: "",
      },
    },
    username : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email : {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName : {
        type: String,
        trim: true
    },
    password : {
        type: String,
        required: [true,'no empty password is allowed'],
    },
    isEmailVerified : {
        type: Boolean,
        default: false
    },
    refreshToken : {
        type: String
    },
    forgotPasswordToken : {
        type: String
    },
    forgotPasswordExpiry : {
        type: Date
    },
    emailVerificationToken : {
        type: String
    },
    emailVerificationExpiry : {
        type: Date
    }
},{ timestamps : true})

//prehooks
userSchema.pre("save",async function (next){
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10);
    next();
});

//verify password
userSchema.methods.verifyPassword=async function (password){
    return await bcrypt.compare(password,this.password);
};

//generate ACCESS TOKEN WITH DATA
userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
};

//generate REFRESH TOKEN WITH DATA
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

//generate token without DATA
userSchema.methods.generateTemporaryToken=function(){
    const unhashedToken=crypto.randomBytes(20).toString("hex");
    const hashedToken=crypto
        .createHash("sha256")  //algorithm used to encrypt returns a hash 
        .update(unhashedToken)  //string to be encrypted using the above hash
        .digest("hex");  //digest string in hexadecimal[encoding] form if nothing is seleced it returns a raw buffer
    const tokenExpiry=Date.now()+(20*60*1000) //20min
    return {unhashedToken,hashedToken,tokenExpiry};
};

export default mongoose.model('User',userSchema);