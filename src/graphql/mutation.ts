export const REGISTER_WEBHOOK_MUTATION = `mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
    webhookSubscriptionCreate(
      topic: $topic
      webhookSubscription: $webhookSubscription
    ) {
      webhookSubscription {
        id
        topic
        endpoint {
          __typename
        }
      }
      userErrors {
        field
        message
      }
    }
  }`;
