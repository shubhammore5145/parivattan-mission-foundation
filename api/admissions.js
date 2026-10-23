import { handleAdmissionsRequest } from "../server/mongoHandler.js";

export default async function handler(req, res) {
  // If req.body is already parsed as object by Vercel, handleAdmissionsRequest handles it
  return handleAdmissionsRequest(req, res);
}
