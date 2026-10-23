import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import {
  admissionsCreateRateLimiter,
  admissionsReadRateLimiter,
  admissionsMutationRateLimiter,
} from "./rateLimiter.js";

let cachedClient = null;
let cachedDb = null;

/**
 * Reads MongoDB URI and DB Name from environment or .env file fallback
 */
export function getMongoConfig() {
  let uri = process.env.MONGODB_URI || "";
  let dbName = process.env.MONGODB_DB_NAME || "parivattan_db";

  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      content.split("\n").forEach((line) => {
        const parts = line.split("=");
        if (parts.length >= 2 && !line.trim().startsWith("#")) {
          const k = parts[0].trim();
          const v = parts.slice(1).join("=").trim();
          if (k === "MONGODB_URI") uri = v;
          if (k === "MONGODB_DB_NAME") dbName = v;
        }
      });
    }
  } catch (e) {
    console.warn("[MongoConfig] Error reading .env:", e);
  }

  return { uri, dbName };
}

/**
 * Connects to MongoDB with connection reuse/pooling
 */
export async function connectToDatabase() {
  const { uri, dbName } = getMongoConfig();

  if (!uri) {
    throw new Error("MONGODB_URI is not set in environment or .env file.");
  }

  if (uri.includes("<db_password>")) {
    throw new Error(
      "MONGODB_URI contains placeholder '<db_password>'. Please replace it with your actual MongoDB password in .env."
    );
  }

  if (cachedClient && cachedDb) {
    try {
      // Ping database to ensure connection is still alive
      await cachedDb.command({ ping: 1 });
      return { client: cachedClient, db: cachedDb };
    } catch {
      // Re-establish connection if dropped
      cachedClient = null;
      cachedDb = null;
    }
  }

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });

  await client.connect();
  const db = client.db(dbName || undefined);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

/**
 * Inserts a new student admission into MongoDB
 */
export async function createAdmissionInMongo(admissionData) {
  const { db } = await connectToDatabase();
  const collection = db.collection("admissions");

  const finalId =
    admissionData.id && String(admissionData.id).trim()
      ? String(admissionData.id).trim()
      : `adm_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

  const record = {
    ...admissionData,
    id: finalId,
    created_at: admissionData.created_at || new Date().toISOString(),
    _createdAt: new Date(),
    source: "mongodb_student_admission",
  };

  const result = await collection.insertOne(record);

  return {
    ...record,
    _id: result.insertedId.toString(),
  };
}

/**
 * Retrieves all admissions from MongoDB
 */
export async function getAdmissionsFromMongo(query = {}) {
  const { db } = await connectToDatabase();
  const collection = db.collection("admissions");

  const records = await collection
    .find(query)
    .sort({ created_at: -1, _id: -1 })
    .toArray();

  return records.map((doc) => ({
    ...doc,
    _id: doc._id ? doc._id.toString() : undefined,
  }));
}

/**
 * Updates an admission in MongoDB
 */
export async function updateAdmissionInMongo(id, updateData) {
  const { db } = await connectToDatabase();
  const collection = db.collection("admissions");

  const filter = {
    $or: [{ id: String(id) }, { _id: id }],
  };

  const cleanUpdate = { ...updateData };
  delete cleanUpdate._id;
  delete cleanUpdate.id;

  const result = await collection.findOneAndUpdate(
    filter,
    { $set: { ...cleanUpdate, updated_at: new Date().toISOString() } },
    { returnDocument: "after" }
  );

  return result;
}

/**
 * Deletes an admission from MongoDB
 */
export async function deleteAdmissionFromMongo(id) {
  const { db } = await connectToDatabase();
  const collection = db.collection("admissions");

  const result = await collection.deleteOne({
    $or: [{ id: String(id) }, { _id: id }],
  });

  return { success: result.deletedCount > 0, count: result.deletedCount };
}

/**
 * Unified request handler for /api/admissions
 * (usable by both Vite dev server middleware and Vercel serverless function)
 */
export async function handleAdmissionsRequest(req, res) {
  const method = req.method;

  // Set CORS & JSON headers
  if (res.setHeader) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Content-Type", "application/json");
  }

  if (method === "OPTIONS") {
    res.statusCode = 200;
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // Enforce method-specific rate limiting
  if (method === "GET") {
    const isAllowed = admissionsReadRateLimiter.apply(req, res);
    if (!isAllowed) return;
  } else if (method === "POST") {
    const isAllowed = admissionsCreateRateLimiter.apply(req, res);
    if (!isAllowed) return;
  } else if (method === "PUT" || method === "DELETE") {
    const isAllowed = admissionsMutationRateLimiter.apply(req, res);
    if (!isAllowed) return;
  }

  try {
    if (method === "GET") {
      // Check for health check or connection test query: /api/admissions?health=true
      const url = req.url || "";
      if (url.includes("health=true") || url.includes("test=true")) {
        const { uri, dbName } = getMongoConfig();
        const hasPlaceholder = uri.includes("<db_password>");
        return res.end(
          JSON.stringify({
            success: !hasPlaceholder,
            connected: !hasPlaceholder,
            dbName,
            hasPlaceholder,
            message: hasPlaceholder
              ? "MongoDB URI contains <db_password> placeholder. Please update .env."
              : "MongoDB URI configured successfully.",
          })
        );
      }

      const admissions = await getAdmissionsFromMongo();
      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          success: true,
          count: admissions.length,
          data: admissions,
          source: "mongodb",
        })
      );
    }

    if (method === "POST") {
      let body = req.body;
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }

      const saved = await createAdmissionInMongo(body || {});
      res.statusCode = 201;
      return res.end(
        JSON.stringify({
          success: true,
          message: "Admission successfully saved to MongoDB",
          data: saved,
          source: "mongodb",
        })
      );
    }

    if (method === "PUT") {
      let body = req.body;
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }

      const id = body.id || (req.url && req.url.split("?id=")[1]);
      if (!id) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({ success: false, error: "Admission ID is required for update." })
        );
      }

      const updated = await updateAdmissionInMongo(id, body);
      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          success: true,
          message: "Admission updated in MongoDB",
          data: updated,
        })
      );
    }

    if (method === "DELETE") {
      const url = req.url || "";
      let id = "";
      if (url.includes("?id=")) {
        id = url.split("?id=")[1].split("&")[0];
      } else if (req.body && req.body.id) {
        id = req.body.id;
      }

      if (!id) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({ success: false, error: "Admission ID is required for deletion." })
        );
      }

      const result = await deleteAdmissionFromMongo(id);
      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          success: true,
          message: "Admission deleted from MongoDB",
          result,
        })
      );
    }

    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, error: "Method Not Allowed" }));
  } catch (err) {
    console.error("[Admissions API Error]:", err?.message || err);
    res.statusCode = 500;
    return res.end(
      JSON.stringify({
        success: false,
        error: err?.message || "Internal server error connecting to MongoDB database",
        source: "mongodb",
      })
    );
  }
}
