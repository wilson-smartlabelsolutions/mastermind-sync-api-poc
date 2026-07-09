import 'dotenv/config';
import Fastify from 'fastify';
import FastifyEnv from '@fastify/env';
import { buildLoggerOptions, serviceLog } from './logger.js';
import shopifyService from './services/shopifyService.js';
import type { FastifyReply, ServerRequest, ShopifyTokenResponse, WebhookSubscriptionInput } from './types.js';
import webhookService from './services/webhookService.js';

interface OAuthCallbackQuery {
  code?: string;
}

const fastify = Fastify({
  logger: buildLoggerOptions(),
});

const start = async (): Promise<void> => {
  await fastify.register(FastifyEnv, {
    confKey: 'config',
    dotenv: {
      path: '.env',
    },
    schema: {
      type: 'object',
      properties: {
        PORT: { type: 'number', default: 9000 },
        MASTERMIND_SHOPIFY_DOMAIN: { type: 'string' },
        MASTERMIND_CLIENT_ID: { type: 'string' },
        MASTERMIND_CLIENT_SECRET: { type: 'string' },
        MASTERMIND_REDIRECT_URI: { type: 'string' },
        MASTERMIND_SCOPES: { type: 'string' },
        MASTERMIND_GRAPHQL_URL: { type: 'string' },
        PRISMART_PROXY_DOMAIN: { type: 'string' },
        PRISMART_USERNAME: { type: 'string' },
        PRISMART_PASSWORD: { type: 'string' },
        CUSTOMER_STORE_CODE: { type: 'string' },
        STORE_CODE: { type: 'string' },
      },
      required: [
        'MASTERMIND_SHOPIFY_DOMAIN',
        'MASTERMIND_CLIENT_ID',
        'MASTERMIND_CLIENT_SECRET',
        'MASTERMIND_REDIRECT_URI',
        'MASTERMIND_SCOPES',
        'MASTERMIND_GRAPHQL_URL',
        'PRISMART_PROXY_DOMAIN',
        'PRISMART_USERNAME',
        'PRISMART_PASSWORD',
        'CUSTOMER_STORE_CODE',
        'STORE_CODE',
      ],
    },
  });

  fastify.get('/health', (_req: ServerRequest, res: FastifyReply) => {
    res.send({ status: 'ok' });
  });

  fastify.get('/sync', async (req: ServerRequest, res: FastifyReply) => {
    const log = serviceLog(req, 'oauth');
    const config = fastify.config;
    const authorizeUrl = new URL(`${config.MASTERMIND_SHOPIFY_DOMAIN}/admin/oauth/authorize`);
    authorizeUrl.searchParams.set('client_id', config.MASTERMIND_CLIENT_ID);
    authorizeUrl.searchParams.set('redirect_uri', `https://localhost:9000${config.MASTERMIND_REDIRECT_URI}`);
    authorizeUrl.searchParams.set('scope', config.MASTERMIND_SCOPES);

    log.info({ url: authorizeUrl.toString() }, 'OAuth authorize URL built');
    const response = await fetch(authorizeUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      redirect: 'follow',
    });
    log.info({ url: response.url }, 'OAuth redirect URL received');
    res.redirect(response.url);
  });

  fastify.get<{ Querystring: OAuthCallbackQuery }>('/oauth/callback', async (req: ServerRequest & { query: OAuthCallbackQuery }, res: FastifyReply) => {
    const log = serviceLog(req, 'oauth');
    log.info('OAuth callback received');
    const code = req.query.code;
    const config = fastify.config;
    log.info({ code }, 'OAuth code received');
    const tokenUrl = new URL(`${config.MASTERMIND_SHOPIFY_DOMAIN}/admin/oauth/access_token`);
    tokenUrl.searchParams.set('client_id', config.MASTERMIND_CLIENT_ID);
    tokenUrl.searchParams.set('client_secret', config.MASTERMIND_CLIENT_SECRET);
    tokenUrl.searchParams.set('code', code ?? '');
    log.info({ tokenUrl: tokenUrl.toString() }, 'Token URL built');
    // try {
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const tokenData = (await tokenResponse.json()) as ShopifyTokenResponse;
    const accessToken = tokenData.access_token;
    log.info({ accessToken }, 'Shopify access token obtained');
    log.info({ authenticated: true }, 'Shopify access token obtained');
    //   const productSyncResult = await shopifyService.getAllAndSyncProducts(req, accessToken);
    //   return res.send(productSyncResult);
    // } catch (error) {
    //   log.error({ err: error }, 'OAuth callback failed');
    //   throw error;
    // }
  });

  fastify.post('/webhooks/register-webhook', async (req: ServerRequest, res: FastifyReply) => {
    const log = serviceLog(req, 'webhook');

    const webhookSubscriptionInput = req.body as WebhookSubscriptionInput;
    log.info({ webhookSubscriptionInput }, 'Webhook subscription input received');
    const webhookSubscriptionResult: any = await webhookService.registerWebhook(req, webhookSubscriptionInput);
    return res.send(webhookSubscriptionResult);
  });

  fastify.post('/webhooks/products/create', async (req: ServerRequest, res: FastifyReply) => {
    const log = serviceLog(req, 'webhook');
  
    const webhookEvent: any = req.body;
    log.info({ webhookEvent }, 'Webhook event received');
    // const webhookSubscriptionResult = await webhookService.registerWebhook(req, webhookSubscriptionInput);
    // return res.send(webhookSubscriptionResult);
  });

  fastify.post('/webhooks/products/update', async (req: ServerRequest, res: FastifyReply) => {
    const log = serviceLog(req, 'webhook');

    const webhookEvent: any = req.body;
    log.info({ webhookEvent }, 'Webhook event received');
    // const webhookSubscriptionResult = await webhookService.registerWebhook(req, webhookSubscriptionInput);
    // return res.send(webhookSubscriptionResult);
  });
  const port = Number(process.env.PORT) || 9000;

  try {
    const address = await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info({ address }, 'Server listening');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

void start();
