import { serviceLog } from '../logger.js';
import type {
  AppRequest,
  FieldMapping,
  MastermindProduct,
  MastermindVariant,
  PrismartArticle,
} from '../types.js';

type PartialPrismartArticle = Partial<PrismartArticle> & Record<string, unknown>;

export const mapMastermindToPrismart = (
  req: AppRequest,
  masterMindProduct: MastermindProduct,
  mapping: FieldMapping,
): PrismartArticle[] => {
  const log = serviceLog(req, 'mapping');
  const result: PrismartArticle[] = [];
  const article: PartialPrismartArticle = {};

  for (const [key, value] of Object.entries(mapping)) {
    if (key === 'sku') {
      continue;
    }
    article[value] = masterMindProduct[key as keyof MastermindProduct];

    // if (key === 'tags') {
    //   article.rsrvTxt1 = masterMindProduct.tags.join(',');
    // }
  }

  for (const variant of masterMindProduct.variants.nodes) {
    const variantResult = mapMastermindVariant(req, variant, mapping);
    if (!variantResult) {
      continue;
    }
    const merged: PrismartArticle = {
      ...(article as PrismartArticle),
      ...(variantResult as PrismartArticle),
      itemName: `${String(article.itemName)}${variantResult.itemName ? " - " + String(variantResult.itemName): ""}`,
    };
    result.push(merged);
  }
  log.info({ variantCount: result.length, productTitle: masterMindProduct.title }, 'Mapped product to Prismart');
  log.debug({ articles: result }, 'Mapped product details');
  return result;
};

const mapMastermindVariant = (
  req: AppRequest,
  mastermindProductVariant: MastermindVariant,
  mapping: FieldMapping,
): PartialPrismartArticle | false => {
  const log = serviceLog(req, 'mapping');
  const mappedVariant: PartialPrismartArticle = {};
  const variantKeys = ['sku', 'title', 'price', 'barcode'] as const;
  for (const key of variantKeys) {
    if(key === "title" && mastermindProductVariant.title === "Default Title") {
      continue;
    }
    const value = mapping[key];

    if (value) {
      mappedVariant[value] = mastermindProductVariant[key];
    }
  }
  if (!mappedVariant.sku) {
    return false;
  }
  log.debug({ variant: mappedVariant }, 'Mapped variant to Prismart');
  return mappedVariant;
};
