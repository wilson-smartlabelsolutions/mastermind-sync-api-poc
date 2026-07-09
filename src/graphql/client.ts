import { serviceLog } from '../logger.js';
import type { AppRequest, GetProductsResponse } from '../types.js';

export const graphqlQueryRequest = async (
  req: AppRequest,
  accessToken: string,
  query: string,
  variables: Record<string, unknown> = {},
  { timeoutMs = 10_000 } = {},
): Promise<GetProductsResponse> => {
  const log = serviceLog(req, 'graphql');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(process.env.MASTERMIND_GRAPHQL_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = (await response.json()) as GetProductsResponse;
    return data;
  } catch (error) {
    log.error({ err: error }, 'Shopify GraphQL request failed');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

export const graphqlMutationRequest = async (
  req: AppRequest,
  accessToken: string,
  mutation: string,
  variables: Record<string, unknown> = {},
  { timeoutMs = 10_000 } = {},
): Promise<GetProductsResponse> => {
  const log = serviceLog(req, 'graphql');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(process.env.MASTERMIND_GRAPHQL_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({ query: mutation, variables }),
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = (await response.json()) as GetProductsResponse;
    return data;
  } catch (error) {
    log.error({ err: error }, 'Shopify GraphQL request failed');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};