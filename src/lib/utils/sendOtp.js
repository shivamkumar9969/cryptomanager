//uils/sendOtp.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false,  // Add this line
    },
});

const sendOtpEmail = async (email, otp) => {
    const mailOptions = {
        from: process.env.SMTP_FROM_EMAIL,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}. It expires in 10 minutes.`,
        html: `<p>Your OTP code is <strong>${otp}</strong>. It expires in 10 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendOtpEmail;
