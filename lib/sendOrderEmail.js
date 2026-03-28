const { emailBrandHtml } = require("./emailBrandHtml");

const sendBrevoEmail = async (toEmail, subject, htmlContent) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL || "ecomercetest100@gmail.com";

  if (!apiKey) {
    console.error("SKIPPING Email: BREVO_API_KEY missing!");
    return;
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
        to: [{ email: toEmail }],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Brevo API Error:", errorData);
    } else {
      console.log("Email sent successfully to:", toEmail);
    }
  } catch (err) {
    console.error("Brevo Fetch FAILED:", err.message);
  }
};

const sendOrderConfirmedEmail = async (customer, orderNumber) => {
  if (!customer?.email) return;
  
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
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-top: 0;" dir="rtl">مرحباً <b>${customer.firstName}</b>،<br>أخبار رائعة! تم تأكيد طلبك وهو قيد التنفيذ الآن.</p>
    
    <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin: 30px 0;">
      <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order Number / رقم الطلب</p>
      <p style="margin: 8px 0 0 0; color: #111827; font-size: 20px; font-weight: bold; font-family: monospace; letter-spacing: 1px;">${orderNumber}</p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Thank you for shopping with us!</p>
  </div>
</div>`;

  await sendBrevoEmail(customer.email, `Order Confirmed / تأكيد الطلب — ${orderNumber}`, html);
};

const sendOrderRejectedEmail = async (customer, orderNumber) => {
  if (!customer?.email) return;

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
    <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-top: 0;" dir="rtl">مرحباً <b>${customer.firstName}</b>،<br>نأسف لإبلاغك بأنه تعذر معالجة طلبك وتم إلغاؤه.</p>
    
    <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; margin: 30px 0;">
      <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Order Number / رقم الطلب</p>
      <p style="margin: 8px 0 0 0; color: #111827; font-size: 20px; font-weight: bold; font-family: monospace; letter-spacing: 1px;">${orderNumber}</p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">If you have any questions, please contact us.</p>
  </div>
</div>`;

  await sendBrevoEmail(customer.email, `Order Cancelled / إلغاء الطلب — ${orderNumber}`, html);
};

module.exports = { sendOrderConfirmedEmail, sendOrderRejectedEmail };
