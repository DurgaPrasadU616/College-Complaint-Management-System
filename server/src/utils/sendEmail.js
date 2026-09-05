const nodemailer = require("nodemailer");
const env = require("../config/env");

const sendEmail = async (options) => {
  // If SMTP is not configured, fallback to console log for local development
  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_EMAIL || !env.SMTP_PASSWORD) {
    console.log("---------------------------------------------------------");
    console.log("Mock Email (SMTP credentials not provided in .env):");
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message:\n${options.message}`);
    console.log("---------------------------------------------------------");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: env.SMTP_EMAIL,
      pass: env.SMTP_PASSWORD,
    },
  });

  const message = {
    from: `${env.FROM_NAME || "College CMS"} <${env.FROM_EMAIL || env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message}</p>`,
  };

  const info = await transporter.sendMail(message);
  console.log("Message sent: %s", info.messageId);
};

module.exports = sendEmail;
