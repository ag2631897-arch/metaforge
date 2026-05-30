import { prisma } from './prisma.js';
import { sendNotificationEmail, type EmailSendResult } from './email.js';
import { broadcastNotification } from './socket.js';

type NotificationMetadata = Record<string, unknown> | null | undefined;

type CreateUserNotificationInput = {
  userId: string;
  type?: string;
  title: string;
  message?: string;
  appId?: string | null;
  metadata?: NotificationMetadata;
  email?: {
    enabled?: boolean;
    to?: string;
    subject?: string;
  };
};

function metadataWithEmailStatus(metadata: NotificationMetadata, email: EmailSendResult | null) {
  const base = metadata && typeof metadata === 'object' && !Array.isArray(metadata) ? metadata : {};
  if (!email) return base;

  return {
    ...base,
    email: {
      sent: email.sent,
      messageId: email.messageId,
      reason: email.reason,
      error: email.error,
    },
  };
}

export async function createUserNotification(input: CreateUserNotificationInput) {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { email: true },
  });

  const shouldEmail = input.email?.enabled !== false;
  const emailTo = input.email?.to || user?.email;
  let emailResult: EmailSendResult | null = null;

  if (shouldEmail && emailTo) {
    emailResult = await sendNotificationEmail({
      to: emailTo,
      subject: input.email?.subject || input.title,
      text: input.message || input.title,
    });
  }

  const notification = await prisma.notification.create({
    data: {
      type: input.type || 'system',
      title: input.title,
      message: input.message || '',
      userId: input.userId,
      appId: input.appId || undefined,
      metadata: metadataWithEmailStatus(input.metadata, emailResult) as any,
    },
  });

  // Broadcast real-time notification via Socket.io
  try {
    broadcastNotification(input.userId, notification);
  } catch {
    // Socket.io may not be initialized in some contexts
  }

  return notification;
}

