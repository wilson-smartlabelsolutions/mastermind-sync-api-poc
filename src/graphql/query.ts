export const GET_PRODUCTS_QUERY = `
query GetProducts($first: Int, $after: String) {
    products(first: $first, after: $after) {
        nodes {
            id
            title
            handle
            status
            descriptionHtml
            productType
            vendor
            createdAt
            updatedAt
            publishedAt
            tags
            priceRangeV2 {
                minVariantPrice {
                    amount
                    currencyCode
                }
                maxVariantPrice {
                    amount
                    currencyCode
                }
            }
            images(first: 5) {
                nodes {
                    id
                    url
                    altText
                }
            }
            variants(first: 10) {
                nodes {
                    id
                    title
                    barcode
                    sku
                    price
                    inventoryQuantity
                }
            }
        }
        pageInfo {
            hasNextPage
            endCursor
        }
    }
}
`;
