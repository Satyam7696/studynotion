const mongoose= require("mongoose");

const courseProgress= new mongoose.Schema({
    courseID :{
        type:mongoose.Schema.Types.ObjectId,
        ref :"Course"
    },

    userID: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
	},
    completedVideo: [
        {
        type:mongoose.Schema.Types.ObjectId,
        ref :"SubSection",
        }
    ]

});

module.exports = mongoose.model("courseProgress", courseProgress);