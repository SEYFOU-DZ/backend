const { Resend } = require("resend");
const { emailBrandHtml } = require("./emailBrandHtml");

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || "onboarding@resend.dev";

const htmlLogo = `
<div style="text-align: center; margin-bottom: 30px;">
  <div style="background-color: #1c1917; color: #ffffff; display: inline-block; padding: 15px 20px; border-radius: 12px; font-weight: 900; font-size: 28px; line-height: 1; letter-spacing: -1px; margin-bottom: 12px; font-family: sans-serif;">
    MA
  </div>
  <div style="font-size: 18px; font-weight: 900; color: #1c1917; letter-spacing: 2px; font-family: sans-serif;">
    MA-AP <span style="font-weight: 300; color: #9ca3af; letter-spacing: normal;">STORE</span>
  </div>
</div>
`;

const sendOrderConfirmedEmail = async (customer, orderNumber) => {
  if (!customer?.email || !process.env.RESEND_API_KEY) return;
  try {
    const html = `
<div style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 40px; text-align: center;" dir="ltr">
  <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    ${emailBrandHtml}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 24px auto;">
      <tr>
        <td style="width:72px;height:72px;background-color:#d1fae5;color:#059669;border-radius:9999px;text-align:center;font-size:34px;font-weight:700;line-height:72px;font-family:Arial,Helvetica,sans-serif;">✓</td>
      </tr>
    </table>
    <h2 style="color: #111827; margin-bottom: 10px; font-size: 24px;">Order Confirmed!</h2>
    <h2 style="color: #111827; margin-bottom: 24px; font-size: 24px;" dir="rtl">تم تأكيد طلبك!</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 5px;">Hello <b>${customer.firstName}</b>,<br>Great news! Your order has been confirmed and is being processed.</p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-top: 0;" dir="rtl">مرحباً <b>${customer.firstName}</b>,<br>أخبار رائعة! تم تأكيد طلبك وهو قيد التنفيذ الآن.</p>
    <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin: 30px 0;">
      <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order Number / رقم الطلب</p>
      <p style="margin: 8px 0 0 0; color: #111827; font-size: 20px; font-weight: bold; font-family: monospace; letter-spacing: 1px;">${orderNumber}</p>
    </div>
    <p style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Thank you for shopping with us!</p>
    <p style="color: #6b7280; font-size: 14px; margin-top: 0;" dir="rtl">شكراً لتسوقك معنا!</p>
  </div>
</div>`;

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customer.email,
      subject: `Order Confirmed / تأكيد الطلب — ${orderNumber}`,
      html,
    });
    if (error) console.error("sendOrderConfirmedEmail Resend error:", error);
    else console.log("Order confirmed email sent to:", customer.email);
  } catch (err) {
    console.error("sendOrderConfirmedEmail error:", err.message);
  }
};

const sendOrderRejectedEmail = async (customer, orderNumber) => {
  if (!customer?.email || !process.env.RESEND_API_KEY) return;
  try {
    const html = `
<div style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 40px; text-align: center;" dir="ltr">
  <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
    ${emailBrandHtml}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:0 auto 24px auto;">
      <tr>
        <td style="width:72px;height:72px;background-color:#fee2e2;color:#dc2626;border-radius:9999px;text-align:center;font-size:30px;font-weight:700;line-height:72px;font-family:Arial,Helvetica,sans-serif;">✕</td>
      </tr>
    </table>
    <h2 style="color: #111827; margin-bottom: 10px; font-size: 24px;">Order Cancelled</h2>
    <h2 style="color: #111827; margin-bottom: 24px; font-size: 24px;" dir="rtl">تم إلغاء الطلب</h2>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 5px;">Hello <b>${customer.firstName}</b>,<br>We regret to inform you that your order could not be processed and has been cancelled.</p>
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-top: 0;" dir="rtl">مرحباً <b>${customer.firstName}</b>,<br>نأسف لإبلاغك بأنه تعذر معالجة طلبك وتم إلغاؤه.</p>
    <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin: 30px 0;">
      <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order Number / رقم الطلب</p>
      <p style="margin: 8px 0 0 0; color: #111827; font-size: 20px; font-weight: bold; font-family: monospace; letter-spacing: 1px;">${orderNumber}</p>
    </div>
    <p style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">If you have any questions, please contact us.</p>
    <p style="color: #6b7280; font-size: 14px; margin-top: 0;" dir="rtl">إذا كان لديك أي أسئلة، يرجى التواصل معنا.</p>
  </div>
</div>`;

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customer.email,
      subject: `Order Cancelled / إلغاء الطلب — ${orderNumber}`,
      html,
    });
    if (error) console.error("sendOrderRejectedEmail Resend error:", error);
    else console.log("Order rejected email sent to:", customer.email);
  } catch (err) {
    console.error("sendOrderRejectedEmail error:", err.message);
  }
};

module.exports = { sendOrderConfirmedEmail, sendOrderRejectedEmail };
