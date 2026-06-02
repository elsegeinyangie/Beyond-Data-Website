import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.office365.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function buildContactTable(data) {
  const rows = [
    ['Name', data.name],
    ['Email', data.email],
    ['Company', data.company || 'Not provided'],
    ['Phone', data.phone || 'Not provided'],
    ['Topic', data.subject],
    ['Message', data.message],
  ];

  let html = '<table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:14px">';
  for (const [label, value] of rows) {
    html += `<tr>
      <td style="padding:10px 14px;border:1px solid #ddd;background:#f5f5f5;font-weight:600;color:#333;white-space:nowrap;vertical-align:top">${label}</td>
      <td style="padding:10px 14px;border:1px solid #ddd;color:#555">${value}</td>
    </tr>`;
  }
  html += '</table>';
  return html;
}

function buildDownloadTable(data) {
  const rows = [
    ['Name', data.name],
    ['Email', data.email],
    ['Company', data.company || 'Not provided'],
    ['Document', data.fileTitle],
    ['Downloaded At', data.downloadedAt],
  ];

  let html = '<table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:14px">';
  for (const [label, value] of rows) {
    html += `<tr>
      <td style="padding:10px 14px;border:1px solid #ddd;background:#f5f5f5;font-weight:600;color:#333;white-space:nowrap;vertical-align:top">${label}</td>
      <td style="padding:10px 14px;border:1px solid #ddd;color:#555">${value}</td>
    </tr>`;
  }
  html += '</table>';
  return html;
}

app.post('/api/send-contact', async (req, res) => {
  const { name, email, company, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  res.json({ success: true });

  try {
    const html = buildContactTable({ name, email, company, phone, subject, message });
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: req.body.recipient || process.env.NOTIFICATION_EMAIL,
      subject: `Beyond Data - ${subject}`,
      html: `<h2 style="font-family:Arial,sans-serif;color:#1a1a2e">New Contact Form Submission</h2>${html}`,
      replyTo: email,
    });
  } catch (err) {
    console.error('Send contact error:', err);
  }
});

app.post('/api/send-download', async (req, res) => {
  const { name, email, company, fileTitle, downloadedAt } = req.body;

  if (!name || !email || !fileTitle) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  res.json({ success: true });

  try {
    const raw = downloadedAt || new Date().toISOString();
    const now = new Date(raw).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true,
    });
    const html = buildDownloadTable({ name, email, company, fileTitle, downloadedAt: now });
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: req.body.recipient || process.env.NOTIFICATION_EMAIL,
      subject: `Beyond Data - ${fileTitle} Downloaded`,
      html: `<h2 style="font-family:Arial,sans-serif;color:#1a1a2e">New Document Download</h2>${html}`,
      replyTo: email,
    });
  } catch (err) {
    console.error('Send download error:', err);
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Email server running on http://localhost:${PORT}`);
});
