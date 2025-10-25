const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify connection on startup
transporter.verify(function (error, success) {
  if (error) {
    console.log('⚠️  Email service not configured:', error.message);
  } else {
    console.log('✅ Email service ready');
  }
});

// Email templates
const emailTemplates = {
  welcome: (userName) => ({
    subject: 'Welcome to SkilLink! 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #21808d;">Welcome to SkilLink, ${userName}! 🤝</h1>
        <p>Thank you for joining our skill exchange community!</p>
        <p>You've received <strong>100 credits</strong> to get started.</p>
        <h3>Get Started:</h3>
        <ul>
          <li>✅ Complete your profile</li>
          <li>🎓 Add your skills</li>
          <li>🔍 Search for people nearby</li>
          <li>📅 Book your first session</li>
        </ul>
        <p style="margin-top: 30px;">
          <a href="http://localhost:5173/dashboard" 
             style="background: #21808d; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 8px; display: inline-block;">
            Go to Dashboard
          </a>
        </p>
        <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          This is an automated email from SkilLink. Please do not reply.
        </p>
      </div>
    `,
  }),

  bookingRequest: (providerName, seekerName, date, time, message) => ({
    subject: '📅 New Booking Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #21808d;">New Booking Request 📅</h1>
        <p>Hi ${providerName},</p>
        <p><strong>${seekerName}</strong> has requested to book a session with you!</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${date}</p>
          <p style="margin: 5px 0;"><strong>🕐 Time:</strong> ${time}</p>
          ${message ? `<p style="margin: 10px 0;"><strong>Message:</strong><br>${message}</p>` : ''}
        </div>
        <p>
          <a href="http://localhost:5173/booking" 
             style="background: #21808d; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 8px; display: inline-block;">
            View & Respond
          </a>
        </p>
      </div>
    `,
  }),

  bookingConfirmed: (seekerName, providerName, date, time) => ({
    subject: '✅ Booking Confirmed!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #21808d;">Booking Confirmed! ✅</h1>
        <p>Hi ${seekerName},</p>
        <p><strong>${providerName}</strong> has confirmed your booking!</p>
        <div style="background: #e8f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${date}</p>
          <p style="margin: 5px 0;"><strong>🕐 Time:</strong> ${time}</p>
        </div>
        <p>Looking forward to your session! Make sure you're prepared.</p>
        <p>
          <a href="http://localhost:5173/booking" 
             style="background: #21808d; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 8px; display: inline-block;">
            View Bookings
          </a>
        </p>
      </div>
    `,
  }),

  creditsAwarded: (userName, amount, reason, newBalance) => ({
    subject: `💰 You earned ${amount} credits!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #21808d;">Credits Earned! 💰</h1>
        <p>Hi ${userName},</p>
        <p>Great news! You've earned <strong>${amount} credits</strong>!</p>
        <div style="background: #e8f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Reason:</strong> ${reason.replace(/_/g, ' ')}</p>
          <p style="margin: 5px 0;"><strong>New Balance:</strong> ${newBalance} credits</p>
        </div>
        <p>Keep up the great work in the SkilLink community!</p>
        <p>
          <a href="http://localhost:5173/dashboard" 
             style="background: #21808d; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 8px; display: inline-block;">
            View Dashboard
          </a>
        </p>
      </div>
    `,
  }),
};

// Send email function
const sendEmail = async (to, templateName, data) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log(`📧 Email would be sent to ${to} - Template: ${templateName} (Email not configured)`);
      return { success: true, messageId: 'email-not-configured' };
    }

    const template = emailTemplates[templateName];
    if (!template) {
      throw new Error(`Email template "${templateName}" not found`);
    }

    const { subject, html } = typeof template === 'function' 
      ? template(...(Array.isArray(data) ? data : [data]))
      : template;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });

    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
