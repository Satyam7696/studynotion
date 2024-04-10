const SubSection = require('../models/SubSection');
const Section = require('../models/Section');
const Course = require("../models/Course");
const { uploadImageToCloudinary } = require('../utils/imageUploader');

//create subsection
exports.createSubSection = async(req,res)=>{
    try{

        //get fetch data from req body
        const {sectionId,title, description,timeDuration,courseId}=req.body;

        //extract video
        const video =req.files.videoFiles;
        
        //validation
        if(!sectionId ||!title ||!description || !courseId ||!video){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            });
        }

        //upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
        console.log(uploadDetails);
        //create subsection
        const SubSectionDetails = await SubSection.create({
            title: title,
            // timeDuration : timeDuration,
            description : description,
            videoUrl : uploadDetails.secure_url,
        });

        //update section with this sub section ObjectId
        const updatedSection = await Section.findByIdAndUpdate (
            {_id:sectionId},
            {$push:{subSection:SubSectionDetails._id}},
            {new:true}
        ).populate("SubSection");
        
        const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();
        //return response
        return res.status(200).json({
            success:true,
            // message:"Sub Section Created Successfully",
            data : updateCourse,
        });
    }
    catch(error){
        console.error("Error creating new sub-section:", error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error",
            error:error.message,
        });
    }
};

// UPDATE a sub-section
exports.updateSubSection = async (req,res) => {

	try {
		// Extract necessary information from the request body
		const { SubsectionId, title , description,courseId } = req.body;
		const video = req?.files?.videoFile;

		
		let uploadDetails = null;
		// Upload the video file to Cloudinary
		if(video){
		 uploadDetails = await uploadImageToCloudinary(
			video,
			process.env.FOLDER_VIDEO
		);
		}

		// Create a new sub-section with the necessary information
		const SubSectionDetails = await SubSection.findByIdAndUpdate({_id:SubsectionId},{
			title: title || SubSection.title,
			// timeDuration: timeDuration,
			description: description || SubSection.description,
			videoUrl: uploadDetails?.secure_url || SubSection.videoUrl,
		},{ new: true });

		
		const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();
		// Return the updated section in the response
		return res.status(200).json({ success: true, data: updatedCourse });
	} catch (error) {
		// Handle any errors that may occur during the process
		console.error("Error creating new sub-section:", error);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
			error: error.message,
		});
	}

}


exports.deleteSubSection = async(req, res) => {

	try {
		const {subSectionId,courseId} = req.body;
		const sectionId=req.body.sectionId;
	if(!subSectionId || !sectionId){
		return res.status(404).json({
            success: false,
            message: "all fields are required",
        });
	}
	const ifsubSection = await SubSection.findById({_id:subSectionId});
	const ifsection= await Section.findById({_id:sectionId});
	if(!ifsubSection){
		return res.status(404).json({
            success: false,
            message: "Sub-section not found",
        });
	}
	if(!ifsection){
		return res.status(404).json({
            success: false,
            message: "Section not found",
        });
    }
	await SubSection.findByIdAndDelete(subSectionId);
	await Section.findByIdAndUpdate({_id:sectionId},{$pull:{subSection:subSectionId}},{new:true});
	const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();
	return res.status(200).json({ success: true, message: "Sub-section deleted", data: updatedCourse });
		
	} catch (error) {
		// Handle any errors that may occur during the process
        console.error("Error deleting sub-section:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
		
	}
};