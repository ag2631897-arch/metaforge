/**
 * MetaForge Workflow Engine
 * 
 * Event-driven automation pipeline. Processes workflow definitions
 * from JSON config into executable jobs.
 * 
 * Components:
 * - TriggerDispatcher: Matches events to workflows
 * - ConditionEvaluator: Runs conditions (AND/OR logic)
 * - ActionRunner: Executes actions sequentially or in parallel
 * - WorkflowLogger: Records execution history
 */

// ─── Types ───────────────────────────────────────────────────────
export interface WorkflowDefinition {
  name: string;
  description?: string;
  enabled: boolean;
  trigger: { type: string; entity?: string; schedule?: string };
  conditions: Array<{ type: string; field?: string; value?: any; role?: string; expression?: string }>;
  conditionLogic: 'and' | 'or';
  actions: Array<{ type: string; config: Record<string, any> }>;
  errorHandling: {
    retry?: { maxAttempts: number; backoff: 'fixed' | 'exponential' };
    onFailure: 'continue' | 'stop' | 'fallback';
  };
  appId?: string; // Add appId for tracking executions
}

export interface WorkflowEvent {
  type: string;
  entity?: string;
  record?: Record<string, any>;
  user?: { id: string; email: string; roles: string[] };
  timestamp: string;
}

export interface WorkflowExecution {
  id: string;
  workflowName: string;
  status: 'running' | 'success' | 'failed' | 'partial';
  startedAt: string;
  completedAt?: string;
  trigger: WorkflowEvent;
  actionResults: Array<{
    actionType: string;
    status: 'success' | 'failed' | 'skipped';
    duration: number;
    error?: string;
  }>;
}

// ─── Trigger Dispatcher ──────────────────────────────────────────
export class TriggerDispatcher {
  private workflows: WorkflowDefinition[] = [];

  registerWorkflows(workflows: WorkflowDefinition[]) {
    this.workflows = workflows.filter(w => w.enabled);
  }

  matchEvent(event: WorkflowEvent): WorkflowDefinition[] {
    return this.workflows.filter(wf => {
      if (wf.trigger.type !== event.type) return false;
      if (wf.trigger.entity && wf.trigger.entity !== event.entity) return false;
      return true;
    });
  }
}

// ─── Condition Evaluator ─────────────────────────────────────────
export class ConditionEvaluator {
  evaluate(
    conditions: WorkflowDefinition['conditions'] | undefined,
    logic: 'and' | 'or' | undefined,
    context: { record?: Record<string, any>; user?: { roles: string[] } }
  ): boolean {
    if (!conditions || conditions.length === 0) return true;

    const results = conditions.map(condition => {
      switch (condition.type) {
        case 'field_equals':
          return context.record?.[condition.field || ''] === condition.value;
        case 'field_contains':
          return String(context.record?.[condition.field || ''] || '').includes(String(condition.value));
        case 'user_has_role':
          return context.user?.roles?.includes(condition.role || '') ?? false;
        case 'date_is_after':
          return new Date() > new Date(condition.value);
        case 'custom_expression':
          // Sandboxed evaluation would go here
          return true;
        default:
          return true;
      }
    });

    return logic === 'and' ? results.every(Boolean) : results.some(Boolean);
  }
}

// ─── Action Runner ───────────────────────────────────────────────
export class ActionRunner {
  async execute(
    action: { type: string; config: Record<string, any> },
    context: { record?: Record<string, any>; user?: any; appId?: string }
  ): Promise<{ success: boolean; error?: string; duration: number }> {
    const start = Date.now();

    try {
      switch (action.type) {
        case 'send_email':
          await this.sendEmail(action.config, context);
          break;
        case 'send_notification':
          await this.sendNotification(action.config, context);
          break;
        case 'update_record':
          await this.updateRecord(action.config, context);
          break;
        case 'create_record':
          await this.createRecord(action.config, context);
          break;
        case 'call_webhook':
          await this.callWebhook(action.config, context);
          break;
        case 'export_csv':
          await this.exportCsv(action.config, context);
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      return { success: true, duration: Date.now() - start };
    } catch (err: any) {
      return { success: false, error: err.message, duration: Date.now() - start };
    }
  }

  private async sendEmail(config: Record<string, any>, context: any): Promise<void> {
    const to = this.interpolate(config.to || context.user?.email, context);
    const subject = this.interpolate(config.subject || 'Workflow notification', context);
    const body = this.interpolate(config.body || config.message || '', context);

    if (!to) {
      throw new Error('Workflow email action requires a recipient.');
    }

    const result = await sendWorkflowEmail({
      to,
      subject,
      text: body,
      html: config.html ? this.interpolate(config.html, context) : undefined,
    });

    if (!result.sent && result.reason !== 'SMTP_NOT_CONFIGURED') {
      throw new Error(result.error || result.reason || 'Failed to send workflow email.');
    }
  }

  private async sendNotification(config: Record<string, any>, context: any): Promise<void> {
    const title = this.interpolate(config.title, context);
    const message = this.interpolate(config.message, context);
    const userId = this.interpolate(config.userId || context.user?.id, context);

    if (!userId) {
      console.log(`[Workflow] Notification skipped without user: ${title} - ${message}`);
      return;
    }

    await createUserNotification({
      userId,
      type: 'workflow',
      title: title || 'Workflow notification',
      message,
      appId: config.appId || context.appId,
      metadata: {
        source: 'workflow',
        action: config,
      },
      email: {
        enabled: config.email !== false,
        to: config.to ? this.interpolate(config.to, context) : undefined,
      },
    });
    return;
    console.log(`[Workflow] Notification: ${title} — ${message}`);
    // In production: publish to Redis pub/sub → Socket.io
  }

  private async updateRecord(config: Record<string, any>, _context: any): Promise<void> {
    console.log(`[Workflow] Update record:`, config);
    // In production: use Prisma to update
  }

  private async createRecord(config: Record<string, any>, _context: any): Promise<void> {
    console.log(`[Workflow] Create record:`, config);
    // In production: use Prisma to create
  }

  private async callWebhook(config: Record<string, any>, context: any): Promise<void> {
    const url = this.interpolate(config.url, context);
    console.log(`[Workflow] Call webhook: ${url}`);
    // In production: use fetch with retry logic
    // await fetch(url, { method: config.method || 'POST', body: JSON.stringify(context.record) });
  }

  private async exportCsv(config: Record<string, any>, _context: any): Promise<void> {
    console.log(`[Workflow] Export CSV for entity:`, config.entity);
    // In production: query DB, stream to CSV, store in MinIO
  }

  private interpolate(template: string, context: any): string {
    if (!template) return '';
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, path) => {
      const parts = path.split('.');
      let value = context;
      for (const part of parts) {
        value = value?.[part];
      }
      return String(value ?? '');
    });
  }
}

import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '../lib/prisma.js';
import { sendEmail as sendWorkflowEmail } from '../lib/email.js';
import { createUserNotification } from '../lib/notifications.js';

const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// ─── Workflow Engine (Orchestrator) ──────────────────────────────
export class WorkflowEngine {
  private dispatcher = new TriggerDispatcher();
  private evaluator = new ConditionEvaluator();
  private runner = new ActionRunner();
  private executionLog: WorkflowExecution[] = [];
  
  private queue: Queue;
  private worker: Worker;

  constructor() {
    this.queue = new Queue('workflow-events', { connection: redisConnection as any });
    
    this.worker = new Worker('workflow-events', async (job: Job) => {
      const { workflow, event } = job.data;
      return await this.executeWorkflow(workflow, event, job.id);
    }, { connection: redisConnection as any });

    this.worker.on('failed', (job, err) => {
      console.error(`[Workflow] Job ${job?.id} failed unexpectedly:`, err);
    });
  }

  loadWorkflows(workflows: WorkflowDefinition[]) {
    this.dispatcher.registerWorkflows(workflows);
  }

  async processEvent(event: WorkflowEvent): Promise<string[]> {
    const matchedWorkflows = this.dispatcher.matchEvent(event);
    const jobIds: string[] = [];

    for (const workflow of matchedWorkflows) {
      const job = await this.queue.add('execute-workflow', { workflow, event }, {
        attempts: workflow.errorHandling.retry?.maxAttempts || 1,
        backoff: workflow.errorHandling.retry?.backoff === 'exponential' ? { type: 'exponential', delay: 1000 } : undefined
      });
      if (job.id) jobIds.push(job.id);
    }

    return jobIds;
  }

  private async executeWorkflow(
    workflow: WorkflowDefinition,
    event: WorkflowEvent,
    jobId?: string
  ): Promise<WorkflowExecution> {
    const executionId = `exec_${jobId || Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const execution: WorkflowExecution = {
      id: executionId,
      workflowName: workflow.name,
      status: 'running',
      startedAt: new Date().toISOString(),
      trigger: event,
      actionResults: [],
    };

    // Create DB Record if appId is present
    if (workflow.appId) {
      try {
        await prisma.workflowExecution.create({
          data: {
            id: executionId,
            workflowName: workflow.name,
            appId: workflow.appId,
            status: 'running',
            triggerType: event.type,
            triggerData: event as any,
          }
        });
      } catch (e) {
        console.error('[Workflow] Failed to save execution start to DB', e);
      }
    }

    // Evaluate conditions
    const conditionsPassed = this.evaluator.evaluate(
      workflow.conditions,
      workflow.conditionLogic || 'and',
      { record: event.record, user: event.user as any }
    );

    if (!conditionsPassed) {
      execution.status = 'success';
      execution.completedAt = new Date().toISOString();
      await this.saveExecutionEnd(execution, workflow.appId);
      return execution;
    }

    // Execute actions
    for (const action of workflow.actions) {
      const maxAttempts = workflow.errorHandling.retry?.maxAttempts || 1;
      let result: { success: boolean; error?: string; duration: number } = {
        success: false,
        duration: 0,
      };

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        result = await this.runner.execute(action, { record: event.record, user: event.user, appId: workflow.appId });
        if (result.success) break;

        // Backoff before retry
        if (attempt < maxAttempts - 1) {
          const delay = workflow.errorHandling.retry?.backoff === 'exponential'
            ? Math.pow(2, attempt) * 1000
            : 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      execution.actionResults.push({
        actionType: action.type,
        status: result.success ? 'success' : 'failed',
        duration: result.duration,
        error: result.error,
      });

      if (!result.success && workflow.errorHandling.onFailure === 'stop') {
        execution.status = 'failed';
        execution.completedAt = new Date().toISOString();
        await this.saveExecutionEnd(execution, workflow.appId);
        // Throwing error allows BullMQ to retry if configured at job level
        throw new Error(result.error || 'Action failed');
      }
    }

    const hasFailures = execution.actionResults.some(r => r.status === 'failed');
    execution.status = hasFailures ? 'partial' : 'success';
    execution.completedAt = new Date().toISOString();
    await this.saveExecutionEnd(execution, workflow.appId);
    return execution;
  }

  private async saveExecutionEnd(execution: WorkflowExecution, appId?: string) {
    this.executionLog.push(execution);
    if (appId) {
      try {
        await prisma.workflowExecution.update({
          where: { id: execution.id },
          data: {
            status: execution.status,
            completedAt: execution.completedAt ? new Date(execution.completedAt) : undefined,
            actionResults: execution.actionResults as any,
            duration: execution.completedAt ? new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime() : 0,
          }
        });
      } catch (e) {
        console.error('[Workflow] Failed to save execution end to DB', e);
      }
    }
  }

  getExecutionLog(): WorkflowExecution[] {
    return this.executionLog;
  }
}

// Singleton instance
export const workflowEngine = new WorkflowEngine();
