export const masterMindToPrismartMapping = {
  sku: 'sku',
  title: 'itemName',
  price: 'price1',
  barcode: 'ean',
  status: 'itemStatus',
  vendor: 'supplierName',
  productType: 'specification',
  // tags: 'rsrvTxt1',
} as const;

export type MasterMindToPrismartMapping = typeof masterMindToPrismartMapping;
