import { prisma } from '../src/lib/prisma.js';
import path from 'path';

async function main() {
  const notifs = await prisma.notification.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  console.log("Recent Notifications:");
  notifs.forEach(n => {
    console.log(`- [${n.createdAt.toISOString()}] ${n.type} | To: ${n.userId} | Title: ${n.title} | Email Sent: ${(n.metadata as any)?.email?.sent}`);
    if ((n.metadata as any)?.email?.error) {
      console.log(`  Email Error: ${(n.metadata as any)?.email?.error}`);
    }
  });
  
  process.exit(0);
}

main().catch(console.error);
