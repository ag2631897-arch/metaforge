import { Server as SocketIOServer } from 'socket.io';
import type { FastifyInstance } from 'fastify';

let io: SocketIOServer;

export function initSocket(app: FastifyInstance) {
  io = new SocketIOServer(app.server, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);
    
    socket.on('join-app', (appId: string) => {
      socket.join(`app_${appId}`);
      console.log(`[Socket.io] Client ${socket.id} joined app_${appId}`);
    });

    socket.on('join-user', (userId: string) => {
      socket.join(`user_${userId}`);
      console.log(`[Socket.io] Client ${socket.id} joined user_${userId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getSocketIO() {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

export function broadcastDeployProgress(appId: string, stage: string, status: string, duration?: number) {
  if (io) {
    io.to(`app_${appId}`).emit('deploy-progress', { stage, status, duration });
  }
}

export function broadcastNotification(userId: string, notification: any) {
  if (io) {
    io.to(`user_${userId}`).emit('notification', notification);
  }
}

export function broadcastToApp(appId: string, event: string, data: any) {
  if (io) {
    io.to(`app_${appId}`).emit(event, data);
  }
}

