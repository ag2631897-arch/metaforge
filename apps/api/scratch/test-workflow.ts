import { workflowEngine } from '../src/workflow/engine.js';
import { prisma } from '../src/lib/prisma.js';

async function main() {
  const appId = '64d83867-256b-436e-8ab8-a8a59119472e'; // Chrono
  
  const app = await prisma.app.findUnique({ where: { id: appId }, include: { owner: true }});
  if (!app) { console.log('App not found'); return; }
  
  const workflow = {
    id: 'wf_test_1',
    name: 'Test Workflow',
    enabled: true,
    trigger: { type: 'record.created', entity: 'TestEntity' },
    actions: [
      {
        id: 'action_1',
        type: 'send_email',
        config: {
          to: 'ag2631897@gmail.com',
          subject: 'Workflow Automation Works!',
          body: 'This is an email triggered by the workflow engine via BullMQ!'
        }
      }
    ],
    errorHandling: {
      retry: { maxAttempts: 2, backoff: 'exponential' }
    }
  };
  
  // Register workflow
  workflowEngine.loadWorkflows([{ ...workflow, appId } as any]);
  
  console.log('Workflow registered. Triggering event...');
  
  const event = {
    type: 'record.created',
    entity: 'TestEntity',
    record: { id: 1, name: 'Test Record' },
    user: { id: app.ownerId, email: app.owner?.email, roles: ['admin'] },
    timestamp: new Date().toISOString()
  };
  
  const jobIds = await workflowEngine.processEvent(event as any);
  console.log(`Enqueued job IDs: ${jobIds}`);
  
  // Wait a few seconds to let BullMQ process it
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Check executions
  const execs = await prisma.workflowExecution.findMany({ where: { workflowName: 'Test Workflow' }, orderBy: { startedAt: 'desc' }, take: 1 });
  console.log('Executions:', JSON.stringify(execs, null, 2));
  
  process.exit(0);
}

main().catch(console.error);
