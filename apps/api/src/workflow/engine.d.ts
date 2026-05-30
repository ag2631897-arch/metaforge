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
export interface WorkflowDefinition {
    name: string;
    description?: string;
    enabled: boolean;
    trigger: {
        type: string;
        entity?: string;
        schedule?: string;
    };
    conditions: Array<{
        type: string;
        field?: string;
        value?: any;
        role?: string;
        expression?: string;
    }>;
    conditionLogic: 'and' | 'or';
    actions: Array<{
        type: string;
        config: Record<string, any>;
    }>;
    errorHandling: {
        retry?: {
            maxAttempts: number;
            backoff: 'fixed' | 'exponential';
        };
        onFailure: 'continue' | 'stop' | 'fallback';
    };
}
export interface WorkflowEvent {
    type: string;
    entity?: string;
    record?: Record<string, any>;
    user?: {
        id: string;
        email: string;
        roles: string[];
    };
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
export declare class TriggerDispatcher {
    private workflows;
    registerWorkflows(workflows: WorkflowDefinition[]): void;
    matchEvent(event: WorkflowEvent): WorkflowDefinition[];
}
export declare class ConditionEvaluator {
    evaluate(conditions: WorkflowDefinition['conditions'], logic: 'and' | 'or', context: {
        record?: Record<string, any>;
        user?: {
            roles: string[];
        };
    }): boolean;
}
export declare class ActionRunner {
    execute(action: {
        type: string;
        config: Record<string, any>;
    }, context: {
        record?: Record<string, any>;
        user?: any;
    }): Promise<{
        success: boolean;
        error?: string;
        duration: number;
    }>;
    private sendEmail;
    private sendNotification;
    private updateRecord;
    private createRecord;
    private callWebhook;
    private exportCsv;
    private interpolate;
}
export declare class WorkflowEngine {
    private dispatcher;
    private evaluator;
    private runner;
    private executionLog;
    loadWorkflows(workflows: WorkflowDefinition[]): void;
    processEvent(event: WorkflowEvent): Promise<WorkflowExecution[]>;
    private executeWorkflow;
    getExecutionLog(): WorkflowExecution[];
}
export declare const workflowEngine: WorkflowEngine;
//# sourceMappingURL=engine.d.ts.map