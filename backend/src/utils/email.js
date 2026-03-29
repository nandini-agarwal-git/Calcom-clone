const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  // Return null if no email config
  return null;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
};

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true
  });
};

const sendConfirmationEmail = async (booking, eventType, host) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log('📧 Email service not configured. Booking confirmed:', booking.uid);
    return;
  }

  const startDate = formatDate(booking.start_time);
  const startTime = formatTime(booking.start_time);
  const endTime = formatTime(booking.end_time);

  const mailOptions = {
    from: `"Cal Clone" <${process.env.FROM_EMAIL}>`,
    to: booking.booker_email,
    subject: `Confirmed: ${eventType.title} with ${host.name}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #6366f1; color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Meeting Confirmed ✓</h1>
        </div>
        <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="color: #111827; margin-top: 0;">${eventType.title}</h2>
          <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 4px 0; color: #6b7280;">📅 <strong>${startDate}</strong></p>
            <p style="margin: 4px 0; color: #6b7280;">🕐 <strong>${startTime} – ${endTime}</strong></p>
            <p style="margin: 4px 0; color: #6b7280;">👤 <strong>Host: ${host.name}</strong></p>
            ${eventType.location ? `<p style="margin: 4px 0; color: #6b7280;">📍 <strong>${eventType.location}</strong></p>` : ''}
          </div>
          <p style="color: #374151;">Hi ${booking.booker_name},</p>
          <p style="color: #374151;">Your meeting has been confirmed. Looking forward to speaking with you!</p>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; text-align: center;">
            <p>Booking ID: ${booking.uid}</p>
          </div>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Confirmation email sent to ${booking.booker_email}`);
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};

const sendCancellationEmail = async (booking, eventType) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log('📧 Email service not configured. Cancellation recorded:', booking.uid);
    return;
  }

  const mailOptions = {
    from: `"Cal Clone" <${process.env.FROM_EMAIL}>`,
    to: booking.booker_email,
    subject: `Cancelled: ${eventType.title}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #ef4444; color: white; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Meeting Cancelled</h1>
        </div>
        <div style="background: white; padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="color: #111827; margin-top: 0;">${eventType.title}</h2>
          <p style="color: #374151;">Hi ${booking.booker_name},</p>
          <p style="color: #374151;">Your meeting scheduled for <strong>${formatDate(booking.start_time)}</strong> at <strong>${formatTime(booking.start_time)}</strong> has been cancelled.</p>
          ${booking.cancellation_reason ? `<p style="color: #374151;">Reason: ${booking.cancellation_reason}</p>` : ''}
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Email send failed:', err.message);
  }
};

module.exports = { sendConfirmationEmail, sendCancellationEmail };
