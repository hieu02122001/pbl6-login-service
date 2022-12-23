const slugify = require('slugify');
const nodemailer = require('nodemailer');
const { User } = require('../models/_User');


const slug = function (str, more) {
  return slugify(str, {
    replacement: '-',
    lower: true,
    locale: 'vi',
    trim: true
  })
}

const sendEmail = async (userId) => {
  const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      service: "gmail",
      port: 587,
      secure: true,
      auth: {
          user: "thanhduong10022001@gmail.com",
          pass: "fdoksxyjumlyhtla",
      }
  });
  //
  try {
    const UI_URL = "http://192.168.10.18:3000/forgot-password";
    await transporter.sendMail({
        from: "thanhduong10022001@gmail.com",
        to: "trunghieuvan01@gmail.com",
        subject: "Reset password link",
        text: `Your reset password link is: ${UI_URL}/${userId}`,
    });

    return { message: "email was sent successfully" };
  } catch (error) {
    throw error;
  }
};

const sendOTP = async ({ userId, email, realEmail, OTP }) => {
  realEmail = realEmail || "trunghieuvan01@gmail.com";
  //
  const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      service: "gmail",
      port: 587,
      secure: true,
      auth: {
          user: "thanhduong10022001@gmail.com",
          pass: "fdoksxyjumlyhtla",
      }
  });
  //
  try {
    await transporter.sendMail({
        from: "thanhduong10022001@gmail.com",
        to: realEmail,
        subject: "OTP FOR RESET PASSWORD",
        text: `Your reset password OTP is: ${OTP}. Please enter your OTP with in 60s`,
    });

    return { 
      message: `Email was sent successfully to ${email}`,
      userId,
      realEmail
    };
  } catch (error) {
    throw error;
  }
};
module.exports = {
  slug,
  sendEmail,
  sendOTP
}