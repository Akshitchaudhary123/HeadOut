const mongoose= require('mongoose');
require('dotenv').config();

exports.dbConnection=async ()=>{
  // console.log(`db pass ${process.env.DB_PASSWORD}`);

    try {
        const connection = await mongoose.connect(process.env.DB_URL);
        console.log("database connected successfully..",connection.connection.host);
    } catch (error) {
      console.log("error in db connection",error);
        
    }


}

