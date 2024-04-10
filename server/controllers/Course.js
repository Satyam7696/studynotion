const Course =require("../models/Course");
const Tag = require("../models/Category");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

//create course handler function
exports.createCourse = async(req,res)=>{
    try{

        //fetch data
        const {courseName,courseDescription,whatYouWillLearn,price,tag}=req.body;

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !tag ||!price || !thumbnail){
            return res.status(400).json({
                success:false,
                message : "All fileds are required",
            });
        }

        //check for instructer
        const userId =req.user.id;
        const instructorDetails = await User.findById(userId);
        console.log("instructorDetails",instructorDetails);

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"Instructor details not found",
            });
        }

        //check given tag is valid or not
        const tagDetails = await Tag.findById(tag);
        if(!tagDetails){
            return res.status(404).json({
                success: false,
                message:"Tag Details not found",
            });
        }

        //upload imagetocloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);

        //create an entry for new course
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            price,
            tag:tagDetails._id,
            thumbnail:thumbnailImage.secure_url,
        })

        //add the new course to the userschema of instructor
        await user.findByIAndUpdate(
            {_id:instructorDetails._id},
            {
                Spush:{
                    courses:newCourse._id,
                }
            },
            {new:true},
        );

        //update tag schema

        //return response
        return res.status(200).json({
            success:true,
            message: "New Course Created Successfully!",
            data:newCourse,
        });
    }
    catch(error){
        console.log(error);
        await res.status(500).json({
            success:false,
            message:"failed to create Course",
            error:error.message,
        })
    }
};

//getAllcourses handler function
exports.getAllCourses = async(req,res)=>
{
    try{
        const allCourses = await Course.find({});
        return res.status(200).json({
            success:true,
            message:"data for all courses fetched successfully",
            data :allCourses,
        });
    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Cannot fetch course data",
            error:error.message,
        });
    }
};

//get coursedetails handler function
exports.getCourseDetails = async (req,res)=>
{
	try {

        //fetch courseId
		const {courseId}=req.body;

        //find courseDetails
        const courseDetails=await Course.find({_id: courseId}).populate({path:"instructor",
        populate:{path:"additionalDetails"}})
        .populate("category")
        .populate({                    //only populate user name and image
            path:"ratingAndReviews",
            populate:{path:"user",select:"firstName lastName accountType image"}
        })
        .populate({path:"courseContent",populate:{path:"subSection"}})
        .exec();

        if(!courseDetails)
        {
            return res.status(404).json
            ({
                success:false,
                message:"Course Not Found"
            })
        }
        return res.status(200).json({
            success:true,
            message:"Course fetched successfully now",
            data:courseDetails,
        });
		
	} 
    catch (error) 
    {
		console.log(error);
        return res.status(400).json
        ({
            success:false,
			message:`Can't Fetch Course Data`,
			error:error.message,
        });
		
	}

};
