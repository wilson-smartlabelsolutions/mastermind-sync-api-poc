import type { FastifyBaseLogger, FastifyReply, FastifyRequest } from 'fastify';
import { WEBHOOK_SUBSCRIPTION_TOPICS } from './enums.js';

export type { AppConfig } from './config.js';
export type { FastifyReply };

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText: string | null;
}

export interface MastermindVariant {
  id: string;
  title: string;
  barcode: string | null;
  sku: string | null;
  price: string;
  inventoryQuantity: number;
}

export interface MastermindProduct {
  id: string;
  title: string;
  handle: string;
  status: string;
  descriptionHtml: string;
  productType: string;
  vendor: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  tags: string[];
  priceRangeV2: { minVariantPrice: Money; maxVariantPrice: Money };
  images: { nodes: ProductImage[] };
  variants: { nodes: MastermindVariant[] };
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface GetProductsResponse {
  data: {
    products: {
      nodes: MastermindProduct[];
      pageInfo: PageInfo;
    };
  };
}

export interface GetProductsVariables {
  first: number;
  after: string | null;
}

export interface ShopifyTokenResponse {
  access_token: string;
}

export interface PrismartTokenResponse {
  access_token: string;
}

export interface PrismartArticle {
  sku: string;
  itemName: string;
  price1: string;
  ean: string;
  itemStatus: string;
  supplierName: string;
  specification: string;
  rsrvTxt1: string;
  description?: string;
}

export interface PrismartUpsertRequest {
  items: PrismartArticle[];
  batchNo: number;
  storeCode: string;
  customerStoreCode: string;
}

export interface SyncResult {
  success: boolean;
  message: string;
}
export interface WebhookSubscriptionInput {
  topic: WEBHOOK_SUBSCRIPTION_TOPICS;
  webhookSubscription: {
    endpoint: string;
    format: string;
  };
}
export type FieldMapping = Record<string, string>;

export interface AppRequest {
  log: FastifyBaseLogger;
}

export type ServerRequest = FastifyRequest & { log: FastifyBaseLogger };
