const Admin = require('./../model/adminModel');
const validator = require('validator');
const brcypt = require('bcryptjs');
const { generateToken } = require('../../../middlewares/verifyJWT');
const  sendEmail  = require('../../../utils/nodeMailer');
const generateOTP =require('./../../../utils/generateOTP');
const { uploadOnCloudinary } = require('../../../utils/cloudinary');



exports.createAdmin =async (req,res)=>{

    try {
        let {name,email,password} = req.body;
       
        name=name?.toLowerCase().trim();
        email=email?.toLowerCase().trim();
        password=password?.trim();
        console.log(`name : ${name}`);
        console.log(`email : ${email}`);
        console.log(`password : ${password}`);
        if(!name){
            return res.send({
                statusCode:404,
                success:false,
                message:'name is required',
                result:{}
            })
        }
        if(!email){
            return res.send({
                statusCode:404,
                success:false,
                message:'email is required',
                result:{}
            })
        }
        if(!validator.isEmail(email)){
            return res.send({
                statusCode:400,
                success:false,
                message:'email is Invalid',
                result:{}
            })
        }
        if(!password){
            return res.send({
                statusCode:404,
                success:false,
                message:'password is required',
                result:{}
            })
        }
        if(!validator.isStrongPassword(password,{minLength: 8,minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1})){
            return res.send({
                statusCode:400,
                success:false,
                message:'password is Invalid',
                result:{}
            })
        }
    
        password =  brcypt.hashSync(password,10);
        let admin = await Admin.findOne({email:email});
        if(admin&&admin.authorised){
            return res.send({
                statusCode:400,
                success:false,
                message:'admin already exist',
                result:{}
            })
        }
        else if(admin&&admin.authorised===false){
            admin = await Admin.findOneAndUpdate({email:email},{
                $set:{
                    name:name,
                    password:password
                }
            })
        }
        else{
            admin = new Admin({name,email,password});
            admin= await admin.save();
        }
        if(!admin){
            return res.send({
                statusCode:400,
                success:false,
                message:'failed to create admin',
                result:{}
            })
        }
    
        let otp = generateOTP();
     
 
     
       // Send email with otp
       let subject = "Verify Email ";
       let html = `<body style="background-color: #f7fafc; margin: 0; padding: 0;">
   <div style="max-width: 24rem; margin: 2rem auto; padding: 1rem; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.5rem; text-align: center;">
     <h1 style="font-size: 1.5rem; font-weight: bold; color: #2d3748;">HeadOut</h1>
     <p style="color: #718096; margin-top: 0.5rem;">We received a request to verify your account with an OTP.</p>
     <p style="color: #718096; margin-top: 1rem;">Your OTP is:</p>
     <p style="font-size: 1.25rem; font-weight: bold; color: #3182ce; margin-top: 0.5rem;"> ${otp}</p>
     <p style="color: #718096; margin-top: 1rem;">If you did not request this, please ignore this email.</p>
    </div>
    </body>`;
 
        console.log(`email in verify admin ${email}`);
        sendEmail(email, subject, html);
        otp = otp.toString();
        console.log(typeof(otp));
 
 
        const otpExpireTime= Date.now()+1000*60  // one minute
        admin = await Admin.findOneAndUpdate({email:email},{
         $set:{
            otp:otp,
            otpExpireTime:otpExpireTime 
         }
        },{new:true})
        return res.send({
            statusCode:201,
            success:true,
            message:'admin created successfully',
            result:{
                // admin,
            }
            
        })
    
    } catch (error) {
        console.log(`error in creating admin: ${error}`);
        return res.send({
            statusCode:500,
            success:true,
            message:'Internal server error',
            result:{
                error:error.message
            }
            
        })
    }


}

exports.sendOTP=async(req,res)=>{
   try {
     let {email} = req.body;
     email=email?.toLowerCase().trim();
 
     let admin= await Admin.findOne({email:email});
     if(!admin){
         return res.send({
             statusCode:404,
             success:false,
             message:"No admin found",
             result:{}
         })
     }
  
     let otp = generateOTP();
     
 
     
       // Send email with otp
       let subject = "Verify Email ";
       let html = `<body style="background-color: #f7fafc; margin: 0; padding: 0;">
   <div style="max-width: 24rem; margin: 2rem auto; padding: 1rem; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 0.5rem; text-align: center;">
     <h1 style="font-size: 1.5rem; font-weight: bold; color: #2d3748;">HeadOut</h1>
     <p style="color: #718096; margin-top: 0.5rem;">We received a request to verify your account with an OTP.</p>
     <p style="color: #718096; margin-top: 1rem;">Your OTP is:</p>
     <p style="font-size: 1.25rem; font-weight: bold; color: #3182ce; margin-top: 0.5rem;"> ${otp}</p>
     <p style="color: #718096; margin-top: 1rem;">If you did not request this, please ignore this email.</p>
    </div>
    </body>`;
 
        console.log(`email in verify admin ${email}`);
        sendEmail(email, subject, html);
        otp = otp.toString();
        console.log(typeof(otp));
 
 
        const otpExpireTime= Date.now()+1000*60  // one minute
        admin = await Admin.findOneAndUpdate({email:email},{
         $set:{
            otp:otp,
            otpExpireTime:otpExpireTime 
         }
        },{new:true})
 
        res.send({
         statusCode:200,
         success:true,
         message:"verify email with otp",
         result:{
          OTP:otp,
         //  admin:admin
         }
        })

   } catch (error) {
    console.log(`error in send otp: ${error}`);
    return res.send({
        statusCode:500,
        success:false,
        message:"Internal Server Error",
        result:{error}
    })
    
   }

}

exports.verifyOTP=async (req,res)=>{
    let {email,otp,fcmToken} = req.body;
    email=email?.toLowerCase().trim();
    otp=otp?.trim();
    fcmToken=fcmToken?.trim();

    let admin = await Admin.findOne({email:email});
    if(!admin){
        return res.send({
            statusCode:404,
            success:false,
            message:"admin not found",
            result:{}
        })
    }

    if (otp.length != 4) {
        return res.send({
          statusCode: 400,
          success: false,
          message: "OTP must be 4 digits",
          result: {},
        });
      }

    if(Date.now()>admin.otpExpireTime){
        return res.send({
            statusCode:400,
            success:false,
            message:"OTP Time Expired",
            result:{}
        })
    }

    if(otp!=admin.otp){
        return res.send({
            statusCode:400,
            success:false,
            message:"OTP not matched",
            result:{}
        })
    }
   
    await Admin.findOneAndUpdate(
        { email: email },
        { $set: { fcmToken: fcmToken } }
    );

    let token= generateToken({_id:admin._id,name:admin.name,email}); 
       return res.send({
        statusCode:200,
        success:true,
        message:"OTP matched successfully",
        result:{
            
            token:token
        }
    })



}

exports.changePassword=async(req,res)=>{
try {
    
        let {newPassword,confirmPassword} = req.body;
        // email=email?.toLowerCase().trim();
        let userId = req.token._id;
        newPassword=newPassword?.trim();
        confirmPassword=confirmPassword?.trim();
    
        let admin= await Admin.findById(userId);
        if(!admin){
            
                return res.send({
                  statusCode: 400,
                  success: false,
                  message: "admin not registered",
                  result: {},
                });
        }
    
        if (!newPassword || !confirmPassword) {
            return res.send({
              statusCode: 400,
              success: false,
              message: "New Password and Confirm Password are required",
              result: {},
            });
          }
    
        if(newPassword!=confirmPassword){
            return res.send({
                statusCode: 400,
                success: false,
                message: "New Password and Confirm Password not matched",
                result: {},
              });
        }
    
        if(!validator.isStrongPassword(newPassword,{minLength: 8,minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1})){
            return res.send({
                statusCode: 400,
                success: false,
                message: "Invalid Password",
                result: {},
              });
        }
    
        let isPasswordSame = await brcypt.compare(newPassword,admin.password);
        if(isPasswordSame){
            
                return res.send({
                  statusCode: 400,
                  success: false,
                  message: "New Password can't be same as Old password",
                  result: {},
                });
              
        }
        newPassword =  brcypt.hashSync(newPassword,10);
    
        admin = await Admin.findOneAndUpdate({_id:userId},{
            $set:{
               password:newPassword
            }
        },{new:true})
    
        
            return res.send({
              statusCode: 200,
              success: true,
              message: "Password changed successfully",
              result: {
                // name:admin.name,
                // email:admin.email
              },
            });
          
    } catch (error) {
        console.log(`error in reset password ${error}`);

        return res.send({
            statusCode: 500,
            success: false,
            message: "Internal Server Error",
            result: {
             
            },
          });
    
}



}

exports.login=async(req,res)=>{

    try {
        let {email,password,fcmToken}= req.body;
        email=email?.toLowerCase().trim();
        password=password?.trim();
        fcmToken=fcmToken?.trim();
    
        if(!email){
            return res.send({
                statusCode: 400,
                success: false,
                message: "email is required",
                result: {},
              });
        }
        if(!password){
            return res.send({
                statusCode: 400,
                success: false,
                message: "password is required",
                result: {},
              });
        }
       
        let admin = await Admin.findOne({email});
        if(!admin){
            return res.send({
                statusCode: 404,
                success: false,
                message: "admin not found",
                result: {},
              });
        }
        console.log(`password: ${password}`);
        let isPasswordSame = await brcypt.compare(password,admin.password);
        console.log(`isPasswordSame : ${isPasswordSame}`);
            if(!isPasswordSame){
                
                    return res.send({
                      statusCode: 400,      
                      success: false,
                      message: "Wrong Password",
                      result: {},
                    });
                  
            }
    
            let token =  generateToken({_id:admin._id,name:admin.name,email:admin.email});
            await Admin.findOneAndUpdate(
                { email: email },
                { $set: { fcmToken: fcmToken } }
            );
            return res.send({
                statusCode: 200,
                success: true,
                message: "admin login successfully",
                result: {
                    token:token
                },
              });
    } catch (error) {
        console.log(`error in login ${error}`);
        return res.send({
            statusCode: 500,
            success: false,
            message: "Internal Server Error",
            result: {},
          });
        
    }
    

}

exports.adminDetails = async(req,res)=>{
try {
     let {_id} = req.token;
     console.log(`_id: ${_id}`);
    
     let admin = await Admin.findById({_id}).select('-_id -__v -status -otpExpireTime -otp -authorised -password ');
    
     if(!admin){
        return res.send({
            statusCode: 404,
            success: false,
            message: "admin not found",
            result: {},
          });
     }
     

    
     return res.send({
        statusCode: 200,
        success: true,
        message: "admin details fetched successfully",
        result: {
            admin:admin,
            
        },
      });
} catch (error) {
    console.log("error in fetching admin",error);
    return res.send({
        statusCode: 500,
        success: false,
        message: "Internal Server Error",
        result: {error:error},
      });
}

}

exports.editProfile = async(req,res)=>{
    try {
        let {name,education,bio,interests} =req.body;
        let {_id} =req.token;
        console.log(interests);
    
    
        name=name?.trim();
        let admin = await Admin.findById(_id);
            if(!admin){
                return res.send({
                    statusCode: 404,
                    success: false,
                    message: "admin not found",
                    result: {},
                  });
             }
             let profileUrl=admin.profileUrl;
            if(req.file){
    
              profileUrl= await  uploadOnCloudinary(req.file.path);
            }
    
            name=name??admin.name;
            profileUrl=profileUrl??admin.profileUrl;
            console.log("interests before",interests);
            
            admin = await Admin.findOneAndUpdate({_id:_id},{
                $set:{
                    name:name,
                    profileUrl:profileUrl,
               }
            },{new:true})
    
                return res.send({
                    statusCode: 200,
                    success: true,
                    message: "admin updated successfully",
                    result: {
                        admin:admin
                    },
                  });
             
    } catch (error) {
        console.log('error in edit profile: ',error);
        return res.send({
            statusCode: 500,
            success: false,
            message: "Internal Server Error",
            result: {},
          });
    }

    


}

