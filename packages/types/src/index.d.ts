/**
 * MetaForge Shared Types
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export type AppStatus = 'draft' | 'deploying' | 'live' | 'error' | 'stopped';
export interface App {
    id: string;
    name: string;
    description?: string;
    status: AppStatus;
    liveUrl?: string;
    configVersion: number;
    createdAt: string;
    updatedAt: string;
    deployedAt?: string;
    ownerId: string;
}
export type DeployStep = 'parsing' | 'generating' | 'building' | 'deploying';
export type DeployStatus = 'pending' | 'running' | 'success' | 'failed';
export interface DeployProgress {
    step: DeployStep;
    status: DeployStatus;
    message?: string;
    progress?: number;
}
export interface DeployResult {
    success: boolean;
    liveUrl?: string;
    validationReport: any;
    deployTime: number;
    steps: DeployProgress[];
}
export interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    role: 'admin' | 'developer' | 'viewer';
    createdAt: string;
}
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    actionUrl?: string;
}
//# sourceMappingURL=index.d.ts.map