const { Resend } = require("resend");
const { emailBrandHtml } = require("./emailBrandHtml");

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";

const generateAndSendOtp = async (user) => {
  const bcrypt = require("bcryptjs");
  const crypto = require("crypto");

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
</div>`;

  if (!process.env.RESEND_API_KEY) {
    console.error("[OTP] SKIPPING: RESEND_API_KEY not set!");
    return { ok: true, emailSent: false };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: "Verify your email / تأكيد بريدك الإلكتروني",
      html,
    });

    if (error) {
      console.error("[OTP] Resend error:", error);
      return { ok: true, emailSent: false };
    }

    console.log("[OTP] Email sent via Resend! id:", data?.id);
    return { ok: true, emailSent: true };
  } catch (err) {
    console.error("[OTP] Resend exception:", err.message);
    return { ok: true, emailSent: false };
  }
};

module.exports = generateAndSendOtp;