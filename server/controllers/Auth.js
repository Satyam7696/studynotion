const User = require('../models/User');
const OTP = require('../models/otp');
const otpGenerater = require('otp-generator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mailSender = require('../utils/mailSender');
const {passwordUpdated}=require('../mail/templates/passwordUpdate');
const Profile=require('../models/Profile');
require('dotenv').config();

//signup
exports.signup = async(req,res) =>
{
    try{
        //data fecth from request ki body
        const{
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp,
        }= req.body;
        //validate 
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp ) {
            return res.status(403).json({
                success:false,
                message:"All fields are required ",
            })
        }

        //2 password match
        if(passowrd !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:'password and ConfirmPassowrd value does not match , please try again',
            });
        }

        //check user already exist or not
        const existinguser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message :"User is already registered . PleaseSign in to continue.",
            });
        }

        //find most recent OTP stored for the user
        const response = await User_OTP.findOne({email}).sort({createdAt:-1}).limit(1);
        console.log(response);

        //validate OTP
        if(response.length == 0){
            return res.status(404).json({
                success:false,
                message:'OTP Found',
            })
        }else if(otp!== response[0].otp){
            //invalid OTP
            return res.status(400).json({
                success:false,
                message:"Invalid OTP"
            });
        }

        //hash password
        const hashedPassword =await bcrypt.hash(password,10);
        
        //create the user
        let approved = "";
        approved ==="Instructor" ? (approved = false) : (approved = true);

        //entry create in DB
        const profileDetails = await Profile.create({
            gender:null,
            dateofBirth: null,
            about:null,
            contactNumber:null,
        });
        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType: accountType,
            approved : approved,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=$(firstName} ${lastName}`,
        });

        //return res
        return res.status(200).json({
            success:true,
            message:"user registered Successfully",
            user,
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"user cannot be registered ,please try again",
        });

    }
};

//login
exports.login = async( req,res)=>{
    try{
        //get data from req body
        const {email,password}=req.body;

        //validation data
        if(!email || !password){
            return res.status(403).json({
                success: false,
                message : "Please fill up All the required fields",
            });
        }
        //user check exist or not
        const user = await Uswer.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered please sign up"
            });
        }

        //generate JWT,After password matching
        if(await bcrypt.compare(password, user.password))
        {
            const payload ={
                email : user.email,
                id : user._id,
                accountType:user.accountType,
            }
            const token=jwt.sign(payload,process.env.JWT_SECRET,
                {
                expiresIn:"24h",
                }
            );

            user.token = token;
            user.password = undefined;

        //create cookie and send response
            const options ={
                expires:new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token",token, options(200).json)({
                success:true,
                token,
                user,
                mesage:"Logged in successfully",
            })
        }
        else {
            return res.status(401).json({
                success:false,
                message:"Password is incorrect"
            });
        }
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Login failure , please try again",
        });
    }
}

//sendOTP
exports.sendotp = async(req,res) =>
{
    try{
        //fetch email from request ki body
        const {email} = req.body;

        //check if user already exist
        const checkUserPresent = await User.findOne({email:email});

        //if user already exist, then return a response
        if(checkUserPresent)
        {
            return res.status(401).json
            ({
                success:false,
                message :'User already registered',
            })
        }

        //if user are not exist
        //generate otp
        var otp = otpGenerater.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets :false,
            specialChars:false,
        });
        // console.log("otp generater :",otp);

        //check unique otp or not
        const result = await OTP.findOne({otp:otp});
        console.log("Result is Generate OTP Func");
		console.log("OTP", otp);
		console.log("Result", result);

        while(result){
            otp = otpGenerater.generate(6,{
                upperCaseAlphabets:false,
            });
        }

        const otpPayload = {email,otp};

        //create an entry for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log("OTP body: ",otpBody);

        //return response successful
        res.status(200).json({
            success:true,
            message:"OTP Sent Auccesfully",
            otp,
        });

    }
    catch(error){
        console.log(error.message);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};

// Controller for Changing Password
exports.changePassword = async (req, res) => {
	try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword, confirmNewPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if(oldPassword === newPassword){
			return res.status(400).json({
				success: false,
				message: "New Password cannot be same as Old Password",
			});
		}
		
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}

		// Match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				"Study Notion - Password Updated",
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};
