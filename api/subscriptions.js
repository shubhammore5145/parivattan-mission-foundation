import { handleSubscriptionsRequest } from "../server/subscriptionHandler.js";

export default async function handler(req, res) {
  return handleSubscriptionsRequest(req, res);
}

