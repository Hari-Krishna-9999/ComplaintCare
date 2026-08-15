const nodemailer = require('nodemailer');
const { emailHost, emailPort, emailUser, emailPassword, emailFrom, emailSecure } = require('../config/env');

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailSecure,
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });

  const info = await transporter.sendMail({
    from: emailFrom,
    to,
    subject,
    text,
    html,
  });

  return info;
};

module.exports = sendEmail;
