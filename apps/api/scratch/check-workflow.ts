import { prisma } from '../src/lib/prisma.js';
async function main() {
  const execs = await prisma.workflowExecution.findMany({ where: { workflowName: 'Test Workflow' }, orderBy: { startedAt: 'desc' }, take: 1 });
  console.log(JSON.stringify(execs, null, 2));
}
main().finally(() => prisma.$disconnect());
