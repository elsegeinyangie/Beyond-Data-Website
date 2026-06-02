import { transporter, buildDownloadTable } from './_transporter.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { name, email, company, fileTitle, downloadedAt } = body;

  if (!name || !email || !fileTitle) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const raw = downloadedAt || new Date().toISOString();
    const now = new Date(raw).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
    const html = buildDownloadTable({ name, email, company, fileTitle, downloadedAt: now });
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: body.recipient || process.env.NOTIFICATION_EMAIL,
      subject: `Beyond Data - ${fileTitle} Downloaded`,
      html: `<h2 style="font-family:Arial,sans-serif;color:#1a1a2e">New Document Download</h2>${html}`,
      replyTo: email,
    });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Send download error:', err);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
