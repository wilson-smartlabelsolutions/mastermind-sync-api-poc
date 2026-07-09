import { graphqlQueryRequest } from '../graphql/client.js';
import { GET_PRODUCTS_QUERY } from '../graphql/query.js';
import { serviceLog } from '../logger.js';
import { mapMastermindToPrismart } from '../utils/mappingHelper.js';
import { masterMindToPrismartMapping } from '../utils/slsMapping.js';
import type { AppRequest, SyncResult } from '../types.js';
import prismartService from './prismartService.js';

const PRODUCTS_PER_PAGE = 100;

const getAllAndSyncProducts = async (req: AppRequest, accessToken: string): Promise<SyncResult> => {
  const log = serviceLog(req, 'shopify');
  let hasNextPage = true;
  let cursor: string | null = null;

  try {
    while (hasNextPage) {
      const variables = {
        first: PRODUCTS_PER_PAGE,
        after: cursor,
      };
      const response = await graphqlQueryRequest(req, accessToken, GET_PRODUCTS_QUERY, variables);
      const products = response.data.products.nodes;
      log.info({ count: products.length }, 'Fetched products from Shopify');

      const prismartProducts = products
        .map((product) => mapMastermindToPrismart(req, product, masterMindToPrismartMapping))
        .flat();
      log.info({ count: prismartProducts.length }, 'Mapped products for Prismart');
      if (prismartProducts.length > 0) {
        await prismartService.upsertArticles(req, prismartProducts);
      }
      hasNextPage = response.data.products.pageInfo.hasNextPage;
      cursor = response.data.products.pageInfo.endCursor;

    }
    return { success: true, message: 'All Products synced successfully' };
  } catch (error) {
    log.error({ err: error }, 'Shopify sync failed');
    throw error;
  }
};

export default {
  getAllAndSyncProducts,
};
