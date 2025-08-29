const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or your provider
    auth: {
      user: "your-email@gmail.com",
      pass: "your-app-password", // Use App Password for Gmail
    },
  });

  await transporter.sendMail({
    from: '"Stock Tracker" <your-email@gmail.com>',
    to,
    subject,
    text,
  });
};

module.exports = sendEmail;
