import type { AppRequest, PrismartArticle, PrismartTokenResponse } from '../types.js';
import { serviceLog } from '../logger.js';

const authenticate = async (req: AppRequest): Promise<PrismartTokenResponse> => {
  const log = serviceLog(req, 'prismart');
  const authUrl = `${process.env.PRISMART_PROXY_DOMAIN}/token`;
  log.debug({ url: authUrl }, 'Authenticating with Prismart');
  const response = await fetch(authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${process.env.PRISMART_USERNAME}:${process.env.PRISMART_PASSWORD}`).toString('base64')}`,
    },
  });
  return response.json() as Promise<PrismartTokenResponse>;
};

const upsertArticles = async (req: AppRequest, products: PrismartArticle[]): Promise<boolean> => {
  if (!products || products.length === 0) {
    return false;
  }

  const log = serviceLog(req, 'prismart');

  try {
    const accessTokenResponse = await authenticate(req);
    log.info({ authenticated: true }, 'Prismart authentication succeeded');

    const accessToken = accessTokenResponse.access_token;
    const upsertUrl = `${process.env.PRISMART_PROXY_DOMAIN}/integration/${process.env.CUSTOMER_STORE_CODE}/${process.env.STORE_CODE}`;
    const requestBody = {
      items: products,
      batchNo: new Date().getTime(),
      storeCode: process.env.STORE_CODE,
      customerStoreCode: process.env.CUSTOMER_STORE_CODE,
    };

    log.info({ count: products.length, url: upsertUrl }, 'Upserting articles to Prismart');
    log.debug({ requestBody }, 'Prismart upsert payload');

    await fetch(upsertUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    log.info({ count: products.length }, 'Upsert complete');
    return true;
  } catch (error) {
    log.error({ err: error }, 'Prismart upsert failed');
    throw error;
  }
};

export default {
  upsertArticles,
};
