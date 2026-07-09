import type { AppRequest } from './types.js';

export type Service = 'oauth' | 'shopify' | 'prismart' | 'mapping' | 'graphql' | 'webhook';

export const buildLoggerOptions = () => ({
  level: process.env.LOG_LEVEL ?? 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss',
      // ignore: 'pid,hostname',
      singleLine: true,
      messageFormat: '{service} | {msg}',
    },
  },
});

export const serviceLog = (req: AppRequest, service: Service) => req.log.child({ service });
