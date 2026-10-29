import { handleVisitorsRequest } from "../server/visitorHandler.js";

export default async function handler(req, res) {
  return handleVisitorsRequest(req, res);
}
