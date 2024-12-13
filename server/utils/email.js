// utils/email.js

const nodemailer = require('nodemailer');
const config = require('../config/config'); // Import config.js

const sendPasswordResetEmail = async (to, resetToken) => {
  const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;

  // Configure the transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Replace with your email service if different
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  const mailOptions = {
    from: config.email.user,
    to,
    subject: 'Password Reset Request',
    text: `You are receiving this email because you requested a password reset.\n\n
           Please click on the following link, or paste it into your browser to complete the process:\n\n
           ${resetUrl}\n\n
           If you did not request this, please ignore this email.\n`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to: ${to}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Could not send password reset email.');
  }
};

module.exports = { sendPasswordResetEmail };
