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

const sendEmail = async (email) => {
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
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error(`Not found user with email [${email}]`);
    }
    //
    const userId = lodash.get(user, "_id");
    const UI_URL = "";
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

module.exports = {
  slug,
  sendEmail
}