const Section = require("../models/Section");
const Course = require("../models/Course");

exports.createSection= async(res,req)=>{
    try{
        //get fetch data
        const {sectionName,courseId}=req.body;
        //data validation
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"Missing properties",
            });
        }
        //create section
        const newSection = await Section.create ({sectionName});
        //update course with section objectId
        const updatedCourse = await Course.findByIdAndUpdate
        (
            courseId,
            {
                $push:{
                    courseContent:newSection._id,
                    },
            },
            {new:true},
        )
        .populate({
            path:"courseContent",
            populates:{
                path:"subSection",
            },
        })
        //return response
        return res.status(200).json({
            success:true,
            message:"Section created successfully",
            updatedCourse,
        });
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Enable to create section,,please try again",
            error:error.message,
        });
    }

}

exports.updateSection = async (req,res) =>
{
    try{
        //data input
        const {sectionName,sectionId,courseId} = req.body;
        console.log(sectionName,sectionId);
        //data validation
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                message:"Missing properties",
            });
        }
        //update data
        const section = await Section.findByIdAndUpdate(sectionId, {sectionName},{new:true});
        //return respons
        const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec(); 
        return res.status(200).json({
            success:true,
            message:"Section Updated successfully",
            updatedCourse,
        });
    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message:"Unable to update Section,please try again",
        });
    }
};

exports.deleteSection = async(req,res)=>{
    try{
        //get id
        const {sectionId} = req.params

        //use findByIdAndDelete
        await Section.findByIdAnddelete (sectionId);

        //return res
        const updatedCourse = await Course.findById(courseId).populate({ path: "courseContent", populate: { path: "subSection" } }).exec();
        return res.status(200).json({
            success:true,
            message:"Section deleted successfully",
            updatedCourse,
        });
    }
    catch(error){
        console.error("Error deleting section",error);
        return res.status(500).json({
            success:false,
            message:"Unable to delete Section,,please try again",
        });
    }
};