import nodemailer from 'nodemailer';

type MailOptions = {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; path: string }[];
};

export const sendMail = async ({ to, subject, html, attachments }: MailOptions) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',        
    port: 587,
    secure: false,                 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
    attachments  
  });
};
