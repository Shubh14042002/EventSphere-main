require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODEMAILER_username, // sender gmail address.
      pass: process.env.PASSWORD // App password from gmail account.
    }
});

const sendEmail = async (to, subject, textBody) => {
    const mailOptions = {
      from: '"EventSphere" eventspherenotification@gmail.com', // The sender's email address
      to, // The recipient's email address
      subject, // The subject of the email
      text: textBody // The plain text body of the email
    };
  
    try {
      let info = await transporter.sendMail(mailOptions);
      console.log('Email sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email: ', error);
      throw error; // Allows calling function to handle the error
    }
};
  

module.exports = { sendEmail };