import { prisma } from '../src/lib/prisma.js';
import path from 'path';

async function main() {
  const apps = await prisma.app.findMany({
    include: { owner: true }
  });
  console.log("Apps:");
  apps.forEach(a => {
    console.log(`- ${a.name} (ID: ${a.id}) | Owner: ${a.owner?.email}`);
  });
  
  process.exit(0);
}

main().catch(console.error);
