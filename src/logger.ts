import type { AppRequest } from './types.js';

export type Service = 'oauth' | 'shopify' | 'prismart' | 'mapping' | 'graphql' | 'webhook';

export const buildLoggerOptions = () => {
  const level = process.env.LOG_LEVEL ?? 'info';
  // ponytail: pino-pretty uses a worker transport; skip in prod/serverless (Vercel, k8s)
  if (process.env.NODE_ENV !== 'production') {
    return {
      level,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss',
          singleLine: true,
          messageFormat: '{service} | {msg}',
        },
      },
    };
  }
  return { level };
};

export const serviceLog = (req: AppRequest, service: Service) => req.log.child({ service });
