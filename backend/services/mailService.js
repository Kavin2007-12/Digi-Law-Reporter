import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';
dotenv.config();

const createTransporter = () => {
  const host = process.env.MAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.MAIL_PORT || '465', 10);
  const secure = process.env.MAIL_SECURE !== 'false';
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_APP_PASSWORD;

  if (!user || !pass || user.includes('YOUR_GMAIL') || pass.includes('YOUR_GMAIL')) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
};

/**
 * Send Main Admin Password Reset Email
 * @param {string} toEmail 
 * @param {string} resetUrl 
 */
export const sendAdminPasswordResetEmail = async (toEmail, resetUrl) => {
  const transporter = createTransporter();

  if (!transporter) {
    logger.warn(`[MAIL NOTICE] Nodemailer credentials not set. Dev Reset Link: ${resetUrl}`);
    console.log(`\n=============================================================`);
    console.log(`🔑 MAIN ADMIN PASSWORD RESET LINK GENERATED (DEV MODE):`);
    console.log(`👉 To: ${toEmail}`);
    console.log(`👉 Link: ${resetUrl}`);
    console.log(`=============================================================\n`);
    return { success: true, simulated: true };
  }

  const mailOptions = {
    from: `"Digital Law Reporter" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: 'Reset your Digital Law Reporter admin password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px; border-b: 1px solid #f1f5f9; pb-16; padding-bottom: 16px;">
          <h2 style="color: #0f172a; margin: 0; font-size: 22px; font-weight: bold;">Digital Law Reporter</h2>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">Password Reset</p>
        </div>
        <div style="padding: 10px 0; margin-bottom: 20px;">
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">We received a request to reset the password for your Digital Law Reporter administrator account.</p>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">Click the button below to create a new password.</p>
          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">Reset Password</a>
          </div>
          <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This password-reset link will expire in 30 minutes.</p>
          <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin-bottom: 0;">If you did not request this password reset, you can safely ignore this email.</p>
        </div>
        <div style="border-t: 1px solid #f1f5f9; pt-16; padding-top: 16px; font-size: 13px; color: #475569;">
          Regards,<br/>
          <strong>Digital Law Reporter</strong><br/>
          <a href="https://www.digilawreporter.in" style="color: #2563eb; text-decoration: none;">www.digilawreporter.in</a>
        </div>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    logger.error(`Failed to send password reset email to ${toEmail}`, err);
    throw err;
  }
};
