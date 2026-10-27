const nodemailer = require('nodemailer');

const createTransporter = () => {
  // If email config is not available, we return null to use mock mode
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    return null;
  }
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Sends an email notification.
 * @param {Object} options - { to, subject, html }
 */
exports.sendEmail = async (options) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log('\n================== EMAIL NOTIFICATION (MOCK) ==================');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Content:\n${options.html.replace(/<[^>]*>?/gm, '')}`); // strip basic HTML
    console.log('===============================================================\n');
    return { success: true, message: 'Mock email sent (check console)' };
  }

  try {
    const info = await transporter.sendMail({
      from: '"ParkWatch System" <noreply@parkwatch.example.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    
    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
};
