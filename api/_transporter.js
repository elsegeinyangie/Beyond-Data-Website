import nodemailer from 'nodemailer';

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

export { transporter, buildContactTable, buildDownloadTable };
