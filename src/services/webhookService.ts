import { serviceLog } from "../logger.js";
import { ServerRequest, WebhookSubscriptionInput } from "../types.js";
import { graphqlMutationRequest } from "../graphql/client.js";
import { REGISTER_WEBHOOK_MUTATION } from "../graphql/mutation.js";


const registerWebhook = async (req: ServerRequest, webhookSubscriptionInput: WebhookSubscriptionInput) => {
  const log = serviceLog(req, 'webhook');
  log.info({ webhookSubscriptionInput }, 'Registering webhook');
  log.info({ headers: req.headers }, 'Headers received' + JSON.stringify(req.headers));
  const accessToken = req.headers['x-shopify-access-token'] as any;   
  if (!accessToken) {
    throw new Error('Access token not found');
  } 
  log.info({ accessToken }, 'Access token received');
  const graphqlRequestResult: any = await graphqlMutationRequest(req, accessToken, REGISTER_WEBHOOK_MUTATION, { topic: webhookSubscriptionInput.topic, webhookSubscription: webhookSubscriptionInput.webhookSubscription });
  return { success: true, message: 'Webhook registered', data: graphqlRequestResult };
};

export default {
  registerWebhook,
};