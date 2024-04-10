const mongoose= require("mongoose");
require ("dotenv").config();

exports.connect = () => {
    mongoose.connect(process.env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(()=> console.log("DB Connected sucessfully"))
    .catch((error)=> {
        console.log('DB Connection Failed');
        console.error(error.message);
        process.exit(1);
    } );
}