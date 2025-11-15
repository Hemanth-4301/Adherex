import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });
};

// Send email function
export const sendEmail = async (to, subject, text) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"Adherex Healthcare" <${process.env.MAIL_USER}>`,
      to,
      subject,
      text,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error.message);
    throw error;
  }
};

export default { sendEmail };
