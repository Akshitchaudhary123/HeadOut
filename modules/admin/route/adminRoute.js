const express= require('express');
const adminRoute = express.Router();
const adminController = require('./../controller/adminController.js');
const upload = require('./../../../middlewares/multer.js');
const verifyToken = require('./../../../middlewares/verifyJWT.js').verifyToken



adminRoute.post('/create-admin',upload.none(),adminController.createAdmin);
adminRoute.post('/send-otp',upload.none(),adminController.sendOTP);
adminRoute.post('/verify-otp',upload.none(),adminController.verifyOTP);
adminRoute.post('/reset-password',upload.none(),adminController.resetPassword);
adminRoute.post('/login',upload.none(),adminController.login);
adminRoute.get('/profile-details',verifyToken,adminController.adminDetails);
adminRoute.post('/edit-profile',verifyToken,upload.single('file'),adminController.editProfile);


module.exports=adminRoute;