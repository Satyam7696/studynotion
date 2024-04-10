const mongoose= require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim:true,
    },
    lastName :{
        type: String,
        required: true,
        trim:true,

    },
    email :{
        type: String,
        required: true,
        trim:true,
    },
    password :{
        type: String,
        required: true,
    },
    accountType: {
        type: String,  // "student" or "Instructor" or "Admin"
        enum:["Admin", "Student" , "Instructor"],
        required: true
    },
    additionalDetails: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: "profile",
    },
    courses: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course"
        }
    ],
    images: {
        type:String,
        rewuired:true,
    },
    token:{
        type:String,
        required:true,
    },
    resetPasswordExpires:{
        type:Date,
    },
    courseProgress: [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref: "CourseProgress",
        }
    ],


});

module.exports = mongoose.model("User", userSchema);