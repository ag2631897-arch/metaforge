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
// ─── Trigger Dispatcher ──────────────────────────────────────────
export class TriggerDispatcher {
    workflows = [];
    registerWorkflows(workflows) {
        this.workflows = workflows.filter(w => w.enabled);
    }
    matchEvent(event) {
        return this.workflows.filter(wf => {
            if (wf.trigger.type !== event.type)
                return false;
            if (wf.trigger.entity && wf.trigger.entity !== event.entity)
                return false;
            return true;
        });
    }
}
// ─── Condition Evaluator ─────────────────────────────────────────
export class ConditionEvaluator {
    evaluate(conditions, logic, context) {
        if (conditions.length === 0)
            return true;
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
    async execute(action, context) {
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
        }
        catch (err) {
            return { success: false, error: err.message, duration: Date.now() - start };
        }
    }
    async sendEmail(config, context) {
        const to = this.interpolate(config.to, context);
        const subject = this.interpolate(config.subject, context);
        const body = this.interpolate(config.body, context);
        console.log(`[Workflow] Send email to ${to}: ${subject}`);
        // In production: use Resend API
        // await resend.emails.send({ from: 'noreply@metaforge.app', to, subject, html: body });
    }
    async sendNotification(config, context) {
        const title = this.interpolate(config.title, context);
        const message = this.interpolate(config.message, context);
        console.log(`[Workflow] Notification: ${title} — ${message}`);
        // In production: publish to Redis pub/sub → Socket.io
    }
    async updateRecord(config, _context) {
        console.log(`[Workflow] Update record:`, config);
        // In production: use Prisma to update
    }
    async createRecord(config, _context) {
        console.log(`[Workflow] Create record:`, config);
        // In production: use Prisma to create
    }
    async callWebhook(config, context) {
        const url = this.interpolate(config.url, context);
        console.log(`[Workflow] Call webhook: ${url}`);
        // In production: use fetch with retry logic
        // await fetch(url, { method: config.method || 'POST', body: JSON.stringify(context.record) });
    }
    async exportCsv(config, _context) {
        console.log(`[Workflow] Export CSV for entity:`, config.entity);
        // In production: query DB, stream to CSV, store in MinIO
    }
    interpolate(template, context) {
        if (!template)
            return '';
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
// ─── Workflow Engine (Orchestrator) ──────────────────────────────
export class WorkflowEngine {
    dispatcher = new TriggerDispatcher();
    evaluator = new ConditionEvaluator();
    runner = new ActionRunner();
    executionLog = [];
    loadWorkflows(workflows) {
        this.dispatcher.registerWorkflows(workflows);
    }
    async processEvent(event) {
        const matchedWorkflows = this.dispatcher.matchEvent(event);
        const executions = [];
        for (const workflow of matchedWorkflows) {
            const execution = await this.executeWorkflow(workflow, event);
            executions.push(execution);
            this.executionLog.push(execution);
        }
        return executions;
    }
    async executeWorkflow(workflow, event) {
        const executionId = `exec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const execution = {
            id: executionId,
            workflowName: workflow.name,
            status: 'running',
            startedAt: new Date().toISOString(),
            trigger: event,
            actionResults: [],
        };
        // Evaluate conditions
        const conditionsPassed = this.evaluator.evaluate(workflow.conditions, workflow.conditionLogic, { record: event.record, user: event.user });
        if (!conditionsPassed) {
            execution.status = 'success';
            execution.completedAt = new Date().toISOString();
            return execution;
        }
        // Execute actions
        for (const action of workflow.actions) {
            const maxAttempts = workflow.errorHandling.retry?.maxAttempts || 1;
            let result = {
                success: false,
                duration: 0,
            };
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                result = await this.runner.execute(action, { record: event.record, user: event.user });
                if (result.success)
                    break;
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
                return execution;
            }
        }
        const hasFailures = execution.actionResults.some(r => r.status === 'failed');
        execution.status = hasFailures ? 'partial' : 'success';
        execution.completedAt = new Date().toISOString();
        return execution;
    }
    getExecutionLog() {
        return this.executionLog;
    }
}
// Singleton instance
export const workflowEngine = new WorkflowEngine();
//# sourceMappingURL=engine.js.map