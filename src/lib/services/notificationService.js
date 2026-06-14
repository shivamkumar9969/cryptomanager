// lib/services/notificationService.js
// Handles in-app database notifications, Emails, and (Phase 2) Push/Telegram

const nodemailer = require('nodemailer');
const dbConnect = require('../dbConnect');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true', 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email using Nodemailer
 */
async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: `CryptoManager <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a notification across allowed channels (In-App + Email)
 * @param {string} userId - User ID
 * @param {object} payload - { title, message, type, link, emailHtml }
 * @param {string} prefKey - which preference to check e.g. "onOrderFilled"
 */
async function sendNotification(userId, payload, prefKey = null) {
  await dbConnect();

  try {
    const user = await User.findById(userId);
    if (!user) return false;

    // 1. Always create In-App Notification (unless user disabled entirely)
    const notification = await Notification.create({
      userId,
      title: payload.title,
      message: payload.message,
      type: payload.type || 'info',
      link: payload.link,
    });

    // 2. Check preferences before sending external channels
    const prefs = user.notificationPrefs || {};
    
    // Check global channel preference (e.g. is email enabled at all?)
    const isEmailAllowed = prefs.email !== false; // defaults true

    // Check specific event preference if provided (e.g. is onOrderFilled enabled?)
    const isEventAllowed = prefKey ? prefs[prefKey] !== false : true;

    // 3. Send Email
    if (isEmailAllowed && isEventAllowed && payload.emailHtml) {
      await sendEmail(user.email, payload.title, payload.emailHtml);
    }

    // Future: Push, Telegram here

    return true;
  } catch (error) {
    console.error('Notification Service Error:', error);
    return false;
  }
}

// ── Pre-defined Templates ──

async function notifyOrderFilled(userId, order) {
  const title = `Order Filled: ${order.side.toUpperCase()} ${order.quantity} ${order.symbol}`;
  const message = `Your ${order.type} order on ${order.exchangeName} has been fully executed at ${order.avgFillPrice}.`;
  
  const emailHtml = `
    <h2>Order Executed Successfully</h2>
    <p>Your order details:</p>
    <ul>
      <li><strong>Exchange:</strong> ${order.exchangeName}</li>
      <li><strong>Pair:</strong> ${order.symbol}</li>
      <li><strong>Side:</strong> ${order.side.toUpperCase()}</li>
      <li><strong>Quantity:</strong> ${order.quantity}</li>
      <li><strong>Fill Price:</strong> ${order.avgFillPrice || order.price}</li>
      <li><strong>Total Value:</strong> ${(order.quantity * (order.avgFillPrice || order.price)).toFixed(4)}</li>
    </ul>
    <p><a href="${process.env.FRONTEND_URL}/orders">View in Dashboard</a></p>
  `;

  return sendNotification(userId, {
    title, message, type: 'order_filled', link: '/orders', emailHtml
  }, 'onOrderFilled');
}

async function notifyOrderFailed(userId, errorMsg, context) {
  const title = `Order Failed: ${context.symbol}`;
  const message = `Failed to place order on ${context.exchangeName}. Reason: ${errorMsg}`;
  
  const emailHtml = `
    <h2 style="color: red;">Action Required: Order Failed</h2>
    <p>An order failed to execute:</p>
    <ul>
      <li><strong>Exchange:</strong> ${context.exchangeName}</li>
      <li><strong>Pair:</strong> ${context.symbol}</li>
      <li><strong>Error:</strong> ${errorMsg}</li>
    </ul>
    <p>Please check your exchange balance and API permissions.</p>
  `;

  return sendNotification(userId, {
    title, message, type: 'order_failed', link: '/orders', emailHtml
  }, 'onOrderFailed');
}

async function notifyAutomationTriggered(userId, triggerName, details) {
  const title = `Automation Triggered: ${triggerName}`;
  const message = `Your automation rule "${triggerName}" has been activated.`;
  
  const emailHtml = `
    <h2>Automation Activated</h2>
    <p>Your automation rule <strong>${triggerName}</strong> has just been triggered.</p>
    <p>${details}</p>
    <p><a href="${process.env.FRONTEND_URL}/automation">View Automations</a></p>
  `;

  return sendNotification(userId, {
    title, message, type: 'automation_triggered', link: '/automation', emailHtml
  }, 'onPriceTriggerFired'); // Or corresponding preference
}

module.exports = {
  sendEmail,
  sendNotification,
  notifyOrderFilled,
  notifyOrderFailed,
  notifyAutomationTriggered
};
