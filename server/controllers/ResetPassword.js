const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const bcrypt = require('bcrypt');

//resetPasswordToken
exports.resetPasswordToken = async (req,res)=>{
    try{
        //get email from req body;
        const email = req.body.email;
        //check user for this email, email validation
        const user = await User.findOne({ email: email });
        if(!user){
            return res.json({
                success: false,
                message:"Your Email is not registered witn us"
            });
        }
        //generate token
        const token = crypto.randomBytes(20).toString("hex");
        //update user by adding token and expiration time
        const updatedDetails = await User.findOneandUpdate({email:email},
            {
                token:token,
                resetPasswordExpires: Date.now() + 5*60*1000,
            },
            {new:true});
        console.log("DETAILS",updatedDetails);
        //create url
        const url = `https//localhost:3000/update-passowrd/${token}`;

        //send mail containing the url
        await mailSender (email,
                        "Password Reset Link",
                        `Your Link for email verification is ${url}.Please click url to reset your password`);
        //return response
        return res.json({
            success:true,
            message:"Email Sent successfully ,please check email to continue further",
        });
    }
    catch(error){
        return res.status(500).json({
            error:error.message,
            success:false,
            message:"Something went wrong while sending reset pwd mail"
        });
    }

};

//resetPassword
exports.resetPassword = async(req,res) => {
    try{
        //data fetch
        const {password,confirmPassword,token}= req.body;

        //validation
        if(password !== confirmPassword){
            return res.josn({
                success:false,
                message:'Password not matching',
            });
        }

        //get userdetails from do using token
        const userDetails = await User.findOne({token:token});
        //if no entry -invalid token
        if(!userDetails){
            return res.json({
                success:false,
                message:"Token is invalid",
            });
        }
        //token time check
        if(userDetails.resetPasswordExpires >Date.now()){
            return res.json({
                success:false,
                message:"Token is expired , please regenerated your token",
            });
        }
        //hash pwd
        const encryptedPassword = await bcrypt.hash(password,10);

        //password update
        await User.findOneAndUpdate(
            {token :token},
            {password:hashedPassword},
            {new:true},
        );

        //return response
        return res.status(200).json({
            success:true,
            message:"Password has been reset successfully"
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while sending reset pwd mail"
        });
    }
    
};