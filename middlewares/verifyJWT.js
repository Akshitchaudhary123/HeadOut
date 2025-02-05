
const jwt = require('jsonwebtoken');
require('dotenv').config()

 exports.generateToken =(payload)=>{

    try {
        console.log(`payload is: ${payload}`);
        let token = jwt.sign(payload,process.env.JWT_SECRET_KEY,{expiresIn:process.env.EXPIRES_IN});
        console.log(`generated token is: ${token}`);
        return token;
        
    } catch (error) {
        console.log(`error in generated token ${error}`);
    }

 }

 exports.verifyToken =(req,res,next)=>{
    const authHeader = req.headers['authorization']; // Access the header
    let token="";
    // console.log("authHeader:",authHeader);

    if (authHeader && authHeader.startsWith('Bearer ')) {
       token = authHeader.split(' ')[1]; // Extract the token
    //   console.log('Token:', token);
    } else {
      console.log('Authorization header not properly formatted or missing');
    }
    
    try {
        if(!token){
            return res.send({
                statusCode:404,
                success:false,
                message:"Token not Found",
                result:{}
            })
        }
    
        let decodedToken= jwt.verify(token,process.env.JWT_SECRET_KEY);
        console.log(`decoded token is: ${decodedToken}`);
        if(!decodedToken){
            return res.send({
                statusCode:401,
                success:false,
                message:"Invalid Token",
                result:{}
            })
        }
        req.token=decodedToken;
        
        next();
    } catch (error) {
        console.log(`error in token verification ${error}`);
    }

 }