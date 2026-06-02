import { transporter, buildContactTable } from './_transporter.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { name, email, company, phone, subject, message } = body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const html = buildContactTable({ name, email, company, phone, subject, message });
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: body.recipient || process.env.NOTIFICATION_EMAIL,
      subject: `Beyond Data - ${subject}`,
      html: `<h2 style="font-family:Arial,sans-serif;color:#1a1a2e">New Contact Form Submission</h2>${html}`,
      replyTo: email,
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Send contact error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
