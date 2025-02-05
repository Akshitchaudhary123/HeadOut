const nodeMailer = require('nodemailer');
require('dotenv').config();

let transporter = nodeMailer.createTransport({
   service:'gmail',
   secure:true,
   auth:{
    user:process.env.NODEMAILER_EMAIL,
    pass:process.env.NODEMAILER_PASSWORD
   }

})

const sendEmail = async (to ,subject, html) => {
  console.log(`email get in sendmail: ${to}`);
    try {
        const mailOptions = {
            from: {
                name: 'HeadOut',
                address: process.env.NODEMAILER_EMAIL 
            },
            to,
            subject,
            html
        }

        transporter.verify(function (error, success) {
            if (error) {
              console.log("Error Inside helper",error);
            } else {
              console.log("Server is ready to take our messages" ,success);
            }
          });

          const isEmailSent = await transporter.sendMail(mailOptions);

          return isEmailSent;

    } catch (error) {
        console.error(`Error sending email: ${error.message}`);
        throw error;
    }
}

module.exports=sendEmail;