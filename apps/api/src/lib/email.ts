import nodemailer, { type Transporter } from 'nodemailer';

const DEFAULT_SENDER_EMAIL = 'ag2631897@gmail.com';
const DEFAULT_FROM = `MetaForge <${DEFAULT_SENDER_EMAIL}>`;

type SendEmailInput = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

export type EmailSendResult = {
  sent: boolean;
  messageId?: string;
  reason?: string;
  error?: string;
};

let transporter: Transporter | null = null;

function readBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
}

function getSmtpUser() {
  return process.env.SMTP_USER || process.env.MAIL_USER || DEFAULT_SENDER_EMAIL;
}

function getSmtpPassword() {
  return process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
}

function getTransporter() {
  if (transporter) return transporter;

  const user = getSmtpUser();
  const pass = getSmtpPassword();

  if (!pass) return null;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || (host === 'smtp.gmail.com' ? 465 : 587));
  const secure = readBoolean(process.env.SMTP_SECURE, port === 465);

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return transporter;
}

export function getEmailStatus() {
  return {
    configured: Boolean(getSmtpPassword()),
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    user: getSmtpUser(),
    from: process.env.MAIL_FROM || process.env.SMTP_FROM || DEFAULT_FROM,
  };
}

export async function sendEmail(input: SendEmailInput): Promise<EmailSendResult> {
  const mailer = getTransporter();

  if (!mailer) {
    return {
      sent: false,
      reason: 'SMTP_NOT_CONFIGURED',
    };
  }

  try {
    const info = await mailer.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_FROM || DEFAULT_FROM,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });

    return { sent: true, messageId: info.messageId };
  } catch (err: any) {
    return {
      sent: false,
      reason: 'SMTP_SEND_FAILED',
      error: err?.message || 'Failed to send email',
    };
  }
}

export async function sendNotificationEmail(input: SendEmailInput) {
  return sendEmail({
    ...input,
    html:
      input.html ||
      `<div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#111827">
        <h2 style="margin:0 0 12px">${input.subject}</h2>
        <p style="margin:0;color:#374151">${input.text || ''}</p>
      </div>`,
  });
}
