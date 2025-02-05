
const mongoose=require('mongoose');

const adminSchema = new mongoose.Schema({
    fcmToken:{
        type:String,
        default:""
    },
    email:{
        type:String,
        required:true,
        default:""
    },
    name:{
        type:String,
        required:true,
        default:""
    },
   
    password:{
        
        type:String,
        required:true,
        // default:""
    },
    status:{
      type:String,
      enum: ["Active","Delete"],
      default:"Active"
    },
    authorised:{
      type:Boolean,
      default:false
    },
    otpExpireTime:{
        type:Date,
        default:Date.now()

    },
    otp:{
        type:String,
        default:""
    },
    profileUrl:{
     type:String,
     default:""
    },
   

},{timestamps:true});

const Admin = mongoose.model('Admin',adminSchema);
module.exports=Admin;