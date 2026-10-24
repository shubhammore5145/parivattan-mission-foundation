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

  // Prevent duplicate entry:
  // 1. If an admission with this ID already exists, update it instead of inserting another one
  // 2. If a record with the same email/phone and program was created within the last 60 seconds or has identical payment_id, update it
  try {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const orConditions = [{ id: finalId }];

    if (admissionData.payment_id && admissionData.payment_id !== "OFFLINE_RECORD") {
      orConditions.push({ payment_id: admissionData.payment_id });
    }

    if (admissionData.email && admissionData.program) {
      orConditions.push({
        email: admissionData.email,
        program: admissionData.program,
        _createdAt: { $gte: oneMinuteAgo },
      });
    }

    const existing = await collection.findOne({ $or: orConditions });
    if (existing) {
      console.log("[MongoDB Atlas] Duplicate/existing record detected, updating instead of inserting:", existing.id || finalId);
      const cleanUpdate = { ...record };
      delete cleanUpdate._id;
      delete cleanUpdate.created_at;
      await collection.updateOne({ _id: existing._id }, { $set: cleanUpdate });
      return {
        ...record,
        id: existing.id || finalId,
        _id: existing._id.toString(),
      };
    }
  } catch (dupCheckErr) {
    console.warn("[MongoDB Atlas] Notice checking for duplicate:", dupCheckErr);
  }

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
 * Deletes an admission from MongoDB by archiving it into deleted_admissions (Recycle Bin)
 */
export async function deleteAdmissionFromMongo(id) {
  const { db } = await connectToDatabase();
  const collection = db.collection("admissions");
  const trashCollection = db.collection("deleted_admissions");

  // 1. Archive to deleted_admissions before deleting
  try {
    const existing = await collection.findOne({
      $or: [{ id: String(id) }, { _id: id }],
    });
    if (existing) {
      const cleanDoc = { ...existing };
      delete cleanDoc._id; // prevent duplicate _id conflict
      await trashCollection.updateOne(
        { id: cleanDoc.id },
        {
          $set: {
            ...cleanDoc,
            deletedAt: new Date().toISOString(),
            deletedBy: "Admin",
          },
        },
        { upsert: true }
      );
    }
  } catch (archiveErr) {
    console.warn("[MongoDB Atlas] Error archiving to deleted_admissions:", archiveErr);
  }

  // 2. Remove from active admissions
  const result = await collection.deleteOne({
    $or: [{ id: String(id) }, { _id: id }],
  });

  return { success: result.deletedCount > 0, count: result.deletedCount };
}

/**
 * Retrieves all deleted admissions from MongoDB trash collection
 */
export async function getDeletedAdmissionsFromMongo() {
  const { db } = await connectToDatabase();
  const trashCollection = db.collection("deleted_admissions");

  const records = await trashCollection
    .find({})
    .sort({ deletedAt: -1, _id: -1 })
    .toArray();

  return records.map((doc) => ({
    ...doc,
    _id: doc._id ? doc._id.toString() : undefined,
  }));
}

/**
 * Restores a deleted admission from MongoDB trash back into active admissions
 */
export async function restoreAdmissionInMongo(id) {
  const { db } = await connectToDatabase();
  const trashCollection = db.collection("deleted_admissions");
  const admissionsCollection = db.collection("admissions");

  const target = await trashCollection.findOne({
    $or: [{ id: String(id) }, { _id: id }],
  });

  if (!target) {
    return null;
  }

  const cleanDoc = { ...target };
  delete cleanDoc._id;
  delete cleanDoc.deletedAt;
  delete cleanDoc.deletedBy;

  // Re-insert / upsert into active admissions
  await admissionsCollection.updateOne(
    { id: cleanDoc.id },
    { $set: cleanDoc },
    { upsert: true }
  );

  // Remove from deleted_admissions
  await trashCollection.deleteOne({
    $or: [{ id: String(id) }, { _id: id }],
  });

  return cleanDoc;
}

/**
 * Permanently deletes an admission from MongoDB trash
 */
export async function permanentDeleteAdmissionFromMongo(id) {
  const { db } = await connectToDatabase();
  const trashCollection = db.collection("deleted_admissions");

  const result = await trashCollection.deleteOne({
    $or: [{ id: String(id) }, { _id: id }],
  });

  return { success: result.deletedCount > 0, count: result.deletedCount };
}

/**
 * Completely empties MongoDB trash collection
 */
export async function emptyTrashInMongo() {
  const { db } = await connectToDatabase();
  const trashCollection = db.collection("deleted_admissions");
  const result = await trashCollection.deleteMany({});
  return { success: true, count: result.deletedCount };
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

      // 1. Check for trash collection query: /api/admissions?trash=true
      if (url.includes("trash=true")) {
        const deleted = await getDeletedAdmissionsFromMongo();
        res.statusCode = 200;
        return res.end(
          JSON.stringify({
            success: true,
            count: deleted.length,
            data: deleted,
            source: "mongodb_trash",
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

      const url = req.url || "";
      // Handle restore action: /api/admissions?restore=true or body.action === "restore"
      if (url.includes("restore=true") || body?.action === "restore") {
        const targetId = body?.id || (url.includes("?id=") ? url.split("?id=")[1].split("&")[0] : null);
        if (!targetId) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ success: false, error: "ID required for restoration." }));
        }
        const restored = await restoreAdmissionInMongo(targetId);
        res.statusCode = 200;
        return res.end(
          JSON.stringify({
            success: true,
            message: "Admission restored to active MongoDB collection",
            data: restored,
          })
        );
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
      let body = req.body || {};
      if (typeof body === "string") {
        try {
          body = JSON.parse(body);
        } catch {
          body = {};
        }
      }

      // Empty Trash
      if (url.includes("emptyTrash=true") || body.action === "emptyTrash") {
        const emptyRes = await emptyTrashInMongo();
        res.statusCode = 200;
        return res.end(
          JSON.stringify({
            success: true,
            message: "MongoDB recycle bin emptied",
            result: emptyRes,
          })
        );
      }

      let id = "";
      if (url.includes("?id=")) {
        id = url.split("?id=")[1].split("&")[0];
      } else if (body && body.id) {
        id = body.id;
      }

      if (!id) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({ success: false, error: "Admission ID is required for deletion." })
        );
      }

      // Permanent Delete from Trash
      if (url.includes("permanent=true") || body.action === "permanentDelete") {
        const permRes = await permanentDeleteAdmissionFromMongo(id);
        res.statusCode = 200;
        return res.end(
          JSON.stringify({
            success: true,
            message: "Permanently deleted from MongoDB recycle bin",
            result: permRes,
          })
        );
      }

      // Standard soft delete (archives to deleted_admissions and removes from active)
      const result = await deleteAdmissionFromMongo(id);
      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          success: true,
          message: "Admission moved to MongoDB recycle bin",
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
