import nodemailer from 'nodemailer';
import emailjs from '@emailjs/nodejs';

// Send OTP via EmailJS if credentials are provided in .env
const tryEmailJs = async (toEmail, otpCode, userName = 'Patient', type = 'verification') => {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;

  if (serviceId && templateId && publicKey) {
    const isReset = type === 'reset';
    const templateParams = {
      to_email: toEmail,
      to_name: userName,
      otp_code: otpCode,
      otp: otpCode,
      user_name: userName,
      email: toEmail,
      subject: isReset ? 'TitanVitals - Password Reset Verification Code' : 'TitanVitals - Email Verification Code',
      message: isReset 
        ? `Your TitanVitals password reset verification code is: ${otpCode}. Valid for 10 minutes.`
        : `Your TitanVitals verification code is: ${otpCode}. Valid for 10 minutes.`,
      action_type: isReset ? 'Password Reset' : 'Account Verification',
      reply_to: 'noreply@titanvitals.ai'
    };

    // 1. Try Direct EmailJS REST API
    try {
      const restRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TitanVitals/1.0',
          'Origin': 'http://localhost:3000'
        },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: templateParams
        }),
        signal: AbortSignal.timeout(5000) // Never hang more than 5s
      });

      if (restRes.ok) {
        console.log(`✉️ [EmailJS REST] ${isReset ? 'Password Reset' : 'Signup'} OTP successfully delivered to ${toEmail}`);
        return { success: true, provider: 'emailjs', status: 200 };
      } else {
        const errorText = await restRes.text();
        console.warn(`EmailJS REST response (${restRes.status}):`, errorText);
      }
    } catch (restErr) {
      console.warn('EmailJS REST fetch notice:', restErr.message);
    }

    // 2. Try @emailjs/nodejs SDK
    try {
      const options = { publicKey };
      if (process.env.EMAILJS_PRIVATE_KEY) {
        options.privateKey = process.env.EMAILJS_PRIVATE_KEY;
      }
      const response = await emailjs.send(serviceId, templateId, templateParams, options);
      console.log(`✉️ [EmailJS SDK] OTP successfully delivered to ${toEmail}. Status: ${response.status}`);
      return { success: true, provider: 'emailjs', status: response.status };
    } catch (sdkErr) {
      console.warn('⚠️ EmailJS SDK notice:', sdkErr.message || sdkErr);
    }
  }
  return null;
};

// Configure nodemailer transporter as backup
const createTransporter = async () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000
    });
  }
  return null;
};

export const sendOtpEmail = async (toEmail, otpCode, userName = 'Patient') => {
  // 1. Try EmailJS first if configured
  const emailJsRes = await tryEmailJs(toEmail, otpCode, userName, 'verification');
  if (emailJsRes && emailJsRes.success) {
    return emailJsRes;
  }

  // 2. Try Nodemailer SMTP
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || `"TitanVitals AI Health" <noreply@titanvitals.ai>`,
      to: toEmail,
      subject: `Your TitanVitals Email Verification Code: ${otpCode}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a1a; color: #ffffff; margin: 0; padding: 40px 20px; }
            .container { max-width: 540px; margin: 0 auto; background: #12122b; border: 1px solid rgba(0, 212, 255, 0.3); border-radius: 20px; padding: 36px 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); }
            .header { text-align: center; margin-bottom: 24px; }
            .logo-text { font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #00d4ff, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.5px; }
            .title { font-size: 20px; font-weight: 700; color: #ffffff; text-align: center; margin-bottom: 8px; }
            .desc { font-size: 14px; color: #a0aec0; text-align: center; line-height: 1.5; margin-bottom: 28px; }
            .otp-box { background: rgba(0, 212, 255, 0.08); border: 2px dashed #00d4ff; border-radius: 14px; padding: 18px; text-align: center; margin-bottom: 28px; }
            .otp-code { font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #00d4ff; font-family: monospace; }
            .timer-note { font-size: 12px; color: #f59e0b; margin-top: 8px; }
            .footer { font-size: 12px; color: #718096; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; line-height: 1.4; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <span class="logo-text">⚡ TitanVitals nxt Gen AI</span>
            </div>
            <h1 class="title">Verify Your Email Address</h1>
            <p class="desc">Hello <strong>${userName}</strong>,<br/>Thank you for registering with TitanVitals. Use the 6-digit verification code below to verify your email and activate your account:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otpCode}</div>
              <div class="timer-note">⏱️ This code is valid for 10 minutes</div>
            </div>

            <p class="desc" style="font-size: 13px;">If you did not request this registration, you can safely ignore this email.</p>

            <div class="footer">
              TitanVitals AI Health Intelligence Systems • Secured by MongoDB<br/>
              © ${new Date().getFullYear()} TitanVitals. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `
    };

    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✉️ OTP Email dispatched to ${toEmail}. Message ID: ${info.messageId}`);
      if (nodemailer.getTestMessageUrl(info)) {
        console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return { success: true, messageId: info.messageId, provider: 'smtp' };
    } else {
      console.log(`✉️ [DEV MODE] OTP for ${toEmail}: ${otpCode}`);
      return { success: true, mock: true, provider: 'dev' };
    }
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

export const sendPasswordResetOtpEmail = async (toEmail, otpCode, userName = 'Patient') => {
  // 1. Try EmailJS first if configured
  const emailJsRes = await tryEmailJs(toEmail, otpCode, userName, 'reset');
  if (emailJsRes && emailJsRes.success) {
    return emailJsRes;
  }

  // 2. Try Nodemailer SMTP
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || `"TitanVitals AI Health" <noreply@titanvitals.ai>`,
      to: toEmail,
      subject: `Your TitanVitals Password Reset Code: ${otpCode}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0a0a1a; color: #ffffff; margin: 0; padding: 40px 20px; }
            .container { max-width: 540px; margin: 0 auto; background: #12122b; border: 1px solid rgba(124, 58, 237, 0.4); border-radius: 20px; padding: 36px 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); }
            .header { text-align: center; margin-bottom: 24px; }
            .logo-text { font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #00d4ff, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.5px; }
            .title { font-size: 20px; font-weight: 700; color: #ffffff; text-align: center; margin-bottom: 8px; }
            .desc { font-size: 14px; color: #a0aec0; text-align: center; line-height: 1.5; margin-bottom: 28px; }
            .otp-box { background: rgba(124, 58, 237, 0.12); border: 2px dashed #a855f7; border-radius: 14px; padding: 18px; text-align: center; margin-bottom: 28px; }
            .otp-code { font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #a855f7; font-family: monospace; }
            .timer-note { font-size: 12px; color: #f59e0b; margin-top: 8px; }
            .security-note { font-size: 12.5px; color: #cbd5e1; background: rgba(255,255,255,0.04); border-left: 3px solid #00d4ff; padding: 12px 14px; border-radius: 6px; margin-bottom: 24px; }
            .footer { font-size: 12px; color: #718096; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; line-height: 1.4; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <span class="logo-text">⚡ TitanVitals nxt Gen AI</span>
            </div>
            <h1 class="title">Password Reset Verification</h1>
            <p class="desc">Hello <strong>${userName}</strong>,<br/>We received a request to reset the password for your TitanVitals account. Use the 6-digit verification code below to proceed with setting a new password:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otpCode}</div>
              <div class="timer-note">⏱️ This code is valid for 10 minutes</div>
            </div>

            <div class="security-note">
              🔒 <strong>Security Warning:</strong> If you did not request a password reset, please ignore this email or change your account security settings immediately.
            </div>

            <div class="footer">
              TitanVitals AI Health Intelligence Systems • Secured by MongoDB<br/>
              © ${new Date().getFullYear()} TitanVitals. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `
    };

    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✉️ Password Reset OTP Email dispatched to ${toEmail}. Message ID: ${info.messageId}`);
      if (nodemailer.getTestMessageUrl(info)) {
        console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      return { success: true, messageId: info.messageId, provider: 'smtp' };
    } else {
      console.log(`✉️ [DEV MODE] Password Reset OTP for ${toEmail}: ${otpCode}`);
      return { success: true, mock: true, provider: 'dev' };
    }
  } catch (error) {
    console.error('Error sending Password Reset OTP email:', error);
    return { success: false, error: error.message };
  }
};
