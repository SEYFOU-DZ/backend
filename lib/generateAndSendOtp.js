const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { emailBrandHtml } = require("./emailBrandHtml");

const generateAndSendOtp = async (user) => {
  // generate OTP
  const otp = String(crypto.randomInt(100000, 999999));
  const hashedOtp = await bcrypt.hash(otp, 10);
  user.otp = hashedOtp;
  user.otpExpiration = Date.now() + 1000 * 60 * 15;
  await user.save();

  const htmlContent = `
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
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
    <p style="color: #9ca3af; font-size: 12px; margin-bottom: 5px;">If you did not request this code, please ignore this email.</p>
  </div>
</div>
  `;

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL || "ecomercetest100@gmail.com";

  if (!apiKey) {
    console.error("[OTP] SKIPPING: BREVO_API_KEY environment variable is missing!");
    return { ok: true, emailSent: false };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: "Varnox Store", email: senderEmail },
        to: [{ email: user.email }],
        subject: "Verify your email / تأكيد بريدك الإلكتروني",
        htmlContent: htmlContent
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("[OTP] Brevo API Error:", errorData);
      return { ok: true, emailSent: false };
    }

    console.log("[OTP] Email sent successfully via Brevo API!");
    return { ok: true, emailSent: true };
  } catch (err) {
    console.error("[OTP] Brevo Fetch FAILED:", err.message);
    return { ok: true, emailSent: false };
  }
};

module.exports = generateAndSendOtp;