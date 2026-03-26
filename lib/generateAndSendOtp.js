const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { emailBrandHtml } = require("./emailBrandHtml");

const generateAndSendOtp = async (user) => {
  // generate OTP
  const otp = String(crypto.randomInt(100000, 999999));
  const hashedOtp = await bcrypt.hash(otp, 10);
  user.otp = hashedOtp;
  user.otpExpiration = Date.now() + 1000 * 60 * 15;
  await user.save();

  const html = `
<div style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 40px; text-align: center;" dir="ltr">
  <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    ${emailBrandHtml}
    
    <h2 style="color: #111827; margin-bottom: 10px; font-size: 24px;">Verify Your Email</h2>
    <h2 style="color: #111827; margin-bottom: 24px; font-size: 24px;" dir="rtl">تأكيد بريدك الإلكتروني</h2>
    
    <p style="color: #4b5563; font-size: 16px; margin-bottom: 8px;">Your verification code is / رمز التحقق الخاص بك هو:</p>
    
    <div style="background-color: #f3f4f6; border: 2px dashed #d1d5db; border-radius: 12px; padding: 20px; margin: 30px 0; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111827;">
      ${otp}
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">This code will expire in 15 minutes.</p>
    <p style="color: #6b7280; font-size: 14px; margin-top: 0;" dir="rtl">ينتهي صلاحية هذا الرمز خلال 15 دقيقة.</p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
    <p style="color: #9ca3af; font-size: 12px; margin-bottom: 5px;">If you did not request this code, please ignore this email.</p>
    <p style="color: #9ca3af; font-size: 12px; margin-top: 0;" dir="rtl">إذا لم تطلب هذا الرمز، يرجى تجاهل هذه الرسالة.</p>
  </div>
</div>
  `;

  const mailUser = process.env.EMAIL;
  const mailPass = process.env.PASS;

  if (!mailUser || !mailPass) {
    console.warn("OTP email skipped: EMAIL/PASS not set in environment variables");
    return { ok: true, emailSent: false };
  }

  try {
    // The standard company approach: Use nodemailer with specific configs
    // to prevent Node.js IPv6 routing timeouts on cloud providers like Render.
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use SSL
      auth: {
        user: mailUser,
        pass: mailPass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.sendMail({
      from: `"MA-AP Store" <${mailUser}>`,
      to: user.email,
      subject: `Verify your email / تأكيد بريدك الإلكتروني`,
      html,
    });

    console.log("[OTP] Email sent successfully!");
    return { ok: true, emailSent: true };
  } catch (err) {
    console.error("[OTP] sendMail FAILED:", err.message);
    return { ok: true, emailSent: false };
  }
};

module.exports = generateAndSendOtp;