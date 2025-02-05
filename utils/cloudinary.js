const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const fs= require('fs');

 // Configuration
 cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_SECRET_KEY // Replace with your actual API secret
});


 exports.uploadOnCloudinary=async (localFilePath)=>{
 try {
    if(!localFilePath) return null;

    // Upload a PDF file
    const uploadResult = await cloudinary.uploader
        .upload(
            localFilePath, // Replace with your PDF URL or local file path
            {
                resource_type: 'auto', // Specify 'raw' for non-image files like PDFs
                public_id: 'sample_file', // Public ID to identify the file in Cloudinary
            }
        )
        .catch((error) => {
            console.error('Upload Error:', error);
        });
    
    console.log('Upload Result:', uploadResult);

    // Transform and deliver the PDF as an image of the first page
    const pdfImageUrl = cloudinary.url('sample_file.pdf', {
        page: 1, // Select the first page of the PDF
        fetch_format: 'auto',
        quality: 'auto',
    });
//    console.log("pdf url: ",pdfImageUrl);
     const fileUrl = uploadResult.secure_url;
     
     // Remove the file from the local file system

     if (fs.existsSync(localFilePath)) {
        await fs.promises.unlink(localFilePath); // Use async unlink
        console.log(`File ${localFilePath} has been deleted.`);
    }
    return fileUrl;

 } catch (error) {
    console.log('PDF Image URL:', pdfImageUrl);
    fs.unlinkSync(localFilePath);
    return null;
 }
}




