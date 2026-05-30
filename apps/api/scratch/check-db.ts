import { prisma } from '../src/lib/prisma.js';
import path from 'path';

async function main() {
  const users = await prisma.user.findMany();
  console.log("Users:", users.map(u => ({ id: u.id, email: u.email })));
  
  process.exit(0);
}

main().catch(console.error);
