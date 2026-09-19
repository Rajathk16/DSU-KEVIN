const nodemailer = require("nodemailer");
const env = require("../config/env");

let transporter;

if (env.emailHost && env.emailUser && env.emailPass) {
  transporter = nodemailer.createTransport({
    host: env.emailHost,
    port: env.emailPort,
    secure: env.emailPort === 465, 
    auth: {
      user: env.emailUser,
      pass: env.emailPass,
    },
  });
}

const sendOTP = async (toEmail, otpCode) => {
  if (!transporter) {
    console.warn("⚠️ Email transporter not configured. Simulating OTP:");
    console.log(`[SIMULATED EMAIL] OTP for ${toEmail}: ${otpCode}`);
    return;
  }

  const mailOptions = {
    from: env.emailFrom || '"KEVIN Platform" <noreply@kevin.edu>',
    to: toEmail,
    subject: "Your KEVIN Registration Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #F7F6F1; color: #17181b;">
        <h2 style="font-family: 'Times New Roman', Times, serif; color: #17181b;">Welcome to KEVIN.</h2>
        <p>You requested to register an account with us. Please use the following one-time password (OTP) to complete your registration:</p>
        <div style="background-color: #E6532D; color: white; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otpCode}
        </div>
        <p style="font-size: 14px; color: #666;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
        <p style="font-size: 12px; color: #999; margin-top: 40px;">Campus Team Synthesis Platform</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Real OTP email successfully sent to ${toEmail}`);
  } catch (error) {
    console.error("❌ Failed to send OTP email:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = {
  sendOTP,
};