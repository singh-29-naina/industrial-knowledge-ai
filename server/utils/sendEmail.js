import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  // Configured to support either direct service strings or custom SMTP hosts
  const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || 'gmail', // 💡 Uses Gmail as the default engine
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS, 
    },
  });

  const mailOptions = {
    from: `"Reliance K-Portal AI Core" <${process.env.SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.htmlMessage,
  };

  await transporter.sendMail(mailOptions);
};