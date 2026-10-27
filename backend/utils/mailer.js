import nodemailer from 'nodemailer';

export const sendPasswordResetEmail = async ({ toEmail, userName, resetUrl }) => {
  let transporter = null;
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (emailUser && emailPass) {
    // 1. Real SMTP / Gmail configured
    if (process.env.SMTP_HOST) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });
    } else {
      // Direct Gmail service
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });
    }
  } else {
    // 2. Development fallback via Ethereal sandbox
    console.log('----------------------------------------------------');
    console.log('ℹ️ NOTE: Real email sending is not yet configured in backend/.env.');
    console.log('To send REAL emails to actual Gmail inboxes:');
    console.log('Add EMAIL_USER=your_email@gmail.com and EMAIL_PASS=your_app_password to backend/.env');
    console.log('----------------------------------------------------');

    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    } catch {
      transporter = null;
    }
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f7f5fb; margin: 0; padding: 40px 20px; color: #202025; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2deea; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
        .header { background: #121018; padding: 32px; text-align: center; }
        .brand { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.04em; text-decoration: none; }
        .brand span { color: #7652f6; display: inline-block; margin-right: 2px; }
        .body { padding: 40px 36px; }
        h1 { font-size: 22px; margin-top: 0; color: #17151e; letter-spacing: -0.03em; }
        p { font-size: 14px; line-height: 1.6; color: #575460; margin: 16px 0; }
        .btn-container { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; background: #7652f6; color: #ffffff !important; font-size: 13px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 9px; box-shadow: 0 4px 14px rgba(118,82,246,0.35); }
        .url-box { background: #fbfaff; border: 1px dashed #d5caee; border-radius: 8px; padding: 12px; font-size: 11px; word-break: break-all; color: #6a6676; margin-top: 20px; }
        .footer { background: #fbf9ff; padding: 20px 36px; border-top: 1px solid #eee; text-align: center; font-size: 11px; color: #9c97a8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand"><span>◒</span>PackZen</div>
        </div>
        <div class="body">
          <h1>Reset your PackZen password</h1>
          <p>Hello ${userName || 'PackZen Creator'},</p>
          <p>We received a request to reset the password for your PackZen account (${toEmail}). Click the button below to choose a new password:</p>
          <div class="btn-container">
            <a href="${resetUrl}" class="btn" target="_blank">Reset Password</a>
          </div>
          <p>This password reset link is valid for <strong>1 hour</strong>. If you did not make this request, you can safely ignore this email — your account remains secure.</p>
          <div class="url-box">
            Or copy and paste this link in your browser:<br>
            <a href="${resetUrl}" style="color: #7652f6;">${resetUrl}</a>
          </div>
        </div>
        <div class="footer">
          PackZen Packaging CAD & 3D Mockup Studio · Designed for packaging creators
        </div>
      </div>
    </body>
    </html>
  `;

  let previewUrl = null;
  const fromAddress = process.env.EMAIL_FROM || (emailUser ? `"PackZen Security" <${emailUser}>` : '"PackZen Security" <security@packzen.com>');

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject: 'Reset your PackZen password',
        text: `Hello ${userName},\n\nReset your PackZen password by visiting: ${resetUrl}\n\nThis link expires in 1 hour.`,
        html: htmlContent
      });

      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log('✓ Password reset email sent successfully to:', toEmail);
      if (previewUrl) {
        console.log('✓ Ethereal Sandbox Link:', previewUrl);
      }
    } catch (err) {
      console.error('✗ Failed to send email via transporter:', err.message);
    }
  }

  // Always log reset URL in console for developer convenience
  console.log('----------------------------------------------------');
  console.log(`[PASSWORD RESET LINK for ${toEmail}]:`);
  console.log(resetUrl);
  console.log('----------------------------------------------------');

  return { success: true, previewUrl, resetUrl, isRealEmail: Boolean(emailUser && emailPass) };
};
