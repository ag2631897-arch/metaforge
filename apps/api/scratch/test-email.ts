import { sendNotificationEmail, getEmailStatus } from '../src/lib/email.js';
import path from 'path';
async function main() {
  console.log("Status:", getEmailStatus());
  console.log("Using SMTP_USER:", process.env.SMTP_USER);
  console.log("Using GMAIL_APP_PASSWORD:", process.env.GMAIL_APP_PASSWORD ? "***" : "undefined");
  
  const result = await sendNotificationEmail({
    to: 'ag2631897@gmail.com',
    subject: 'MetaForge Notification Test',
    text: 'If you receive this, email configuration is working perfectly.'
  });
  
  console.log('Send Result:', result);
  process.exit(0);
}

main().catch(console.error);
