import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mapMastermindToPrismart } from './mappingHelper.js';
import { masterMindToPrismartMapping } from './slsMapping.js';
import type { AppRequest, MastermindProduct } from '../types.js';

const mockLog = {
  info: () => {},
  error: () => {},
  debug: () => {},
  child: () => mockLog,
};

const req = {
  log: mockLog,
} as unknown as AppRequest;

const baseProduct = (): MastermindProduct => ({
  id: 'gid://shopify/Product/1',
  title: 'Product Title',
  handle: 'product-title',
  status: 'ACTIVE',
  descriptionHtml: '<p>desc</p>',
  productType: 'Toy',
  vendor: 'Acme',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-02T00:00:00Z',
  publishedAt: '2026-01-01T00:00:00Z',
  tags: ['organic', 'sale'],
  priceRangeV2: {
    minVariantPrice: { amount: '10.00', currencyCode: 'CAD' },
    maxVariantPrice: { amount: '20.00', currencyCode: 'CAD' },
  },
  images: { nodes: [] },
  variants: {
    nodes: [
      {
        id: 'gid://shopify/ProductVariant/1',
        title: 'Default',
        barcode: '1234567890123',
        sku: 'SKU-001',
        price: '10.00',
        inventoryQuantity: 5,
      },
    ],
  },
});

describe('mapMastermindToPrismart', () => {
  it('maps product-level fields', () => {
    const result = mapMastermindToPrismart(req, baseProduct(), masterMindToPrismartMapping);
    assert.equal(result.length, 1);
    assert.equal(result[0].itemName, 'Product Title - Default');
    assert.equal(result[0].supplierName, 'Acme');
    assert.equal(result[0].specification, 'Toy');
    assert.equal(result[0].itemStatus, 'ACTIVE');
  });

  // it('joins tags into rsrvTxt1', () => {
  //   const result = mapMastermindToPrismart(req, baseProduct(), masterMindToPrismartMapping);
  //   assert.equal(result[0].rsrvTxt1, 'organic,sale');
  // });

  it('merges variant and article fields', () => {
    const result = mapMastermindToPrismart(req, baseProduct(), masterMindToPrismartMapping);
    assert.equal(result[0].sku, 'SKU-001');
    assert.equal(result[0].price1, '10.00');
    assert.equal(result[0].ean, '1234567890123');
    assert.equal(result[0].itemName, 'Product Title - Default');
  });

  it('skips variants without sku', () => {
    const product = baseProduct();
    product.variants.nodes = [
      { ...product.variants.nodes[0], sku: null, title: 'No SKU' },
      { ...product.variants.nodes[0], sku: 'SKU-002', title: 'Has SKU' },
    ];
    const result = mapMastermindToPrismart(req, product, masterMindToPrismartMapping);
    assert.equal(result.length, 1);
    assert.equal(result[0].sku, 'SKU-002');
    assert.equal(result[0].itemName, 'Product Title - Has SKU');
  });

  it('returns multiple rows for multiple valid variants', () => {
    const product = baseProduct();
    product.variants.nodes = [
      { ...product.variants.nodes[0], sku: 'SKU-A', title: 'Small' },
      { ...product.variants.nodes[0], sku: 'SKU-B', title: 'Large' },
    ];
    const result = mapMastermindToPrismart(req, product, masterMindToPrismartMapping);
    assert.equal(result.length, 2);
    assert.equal(result[0].sku, 'SKU-A');
    assert.equal(result[1].sku, 'SKU-B');
  });

  it('returns empty array when there are no variants', () => {
    const product = baseProduct();
    product.variants.nodes = [];
    const result = mapMastermindToPrismart(req, product, masterMindToPrismartMapping);
    assert.deepEqual(result, []);
  });
});
