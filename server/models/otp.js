const mongoose= require("mongoose");
const mailSender = require("../utils/mailSender");
const OTPSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        dafault:Date.now(),
        expire: 5*60,
    }
});

///a function => to send emails
async function sendVerificationEmail(email,otp){
    try{
        const mailResponse = await mailSender(email,"verification Email from studcoders",otp);
        console.log("EMail Sent Sucessfully ", mailResponse);
    }
    catch(error){
        console.log("error occured while sending mails: ",error);
        throw error;
    }
}

OTPSchema.pre("save",async function(next){
    await sendVerificationEmail(this.email,this.otp);
    next();
})

module.exports = mongoose.model("OTP",OTPSchema);