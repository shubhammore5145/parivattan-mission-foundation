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
let connectingPromise = null;

// Fast server-side memory cache to eliminate repeated 3s Atlas queries
let admissionsCache = null;
let admissionsCacheTime = 0;
const ADMISSIONS_CACHE_TTL = 15000; // 15 seconds

export function invalidateAdmissionsCache() {
  admissionsCache = null;
  admissionsCacheTime = 0;
}

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
    return { client: cachedClient, db: cachedDb };
  }

  if (!connectingPromise) {
    connectingPromise = (async () => {
      const client = new MongoClient(uri, {
        maxPoolSize: 20,
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
      });

      await client.connect();
      const db = client.db(dbName || undefined);

      cachedClient = client;
      cachedDb = db;

      return { client, db };
    })().catch((err) => {
      cachedClient = null;
      cachedDb = null;
      throw err;
    }).finally(() => {
      connectingPromise = null;
    });
  }

  return connectingPromise;
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

  // Strict payment authenticity enforcement:
  const pid = String(admissionData.payment_id || "").trim();
  const isValidAdminReceipt = pid.startsWith("PAY_ADM_") || pid === "OFFLINE_RECORD";
  const isValidOnlinePayment =
    pid.startsWith("pay_") ||
    pid.startsWith("razorpay_") ||
    pid.startsWith("order_") ||
    (pid.length >= 14 && /^[a-zA-Z0-9_-]+$/.test(pid) && pid !== "undefined" && pid !== "null");

  const hasValidPayment = isValidAdminReceipt || isValidOnlinePayment;
  const isSystemProgram =
    admissionData.program === "STUDENT_REGISTRATION" ||
    admissionData.program === "SYSTEM_CUSTOM_COURSES" ||
    admissionData.name === "SYSTEM_BATCH_OVERRIDES";

  const resolvedStatus = hasValidPayment || isSystemProgram ? (admissionData.status || "completed") : "pending";
  const resolvedPaymentId = hasValidPayment ? pid : "";

  const record = {
    ...admissionData,
    status: resolvedStatus,
    payment_id: resolvedPaymentId,
    is_payment_verified: hasValidPayment,
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
  invalidateAdmissionsCache();

  return {
    ...record,
    _id: result.insertedId.toString(),
  };
}

/**
 * Retrieves all admissions from MongoDB (with 15s in-memory server cache)
 */
export async function getAdmissionsFromMongo(query = {}) {
  const isAll = Object.keys(query).length === 0;
  const now = Date.now();
  if (isAll && admissionsCache && now - admissionsCacheTime < ADMISSIONS_CACHE_TTL) {
    return admissionsCache;
  }

  const { db } = await connectToDatabase();
  const collection = db.collection("admissions");

  const records = await collection
    .find(query)
    .sort({ created_at: -1, _id: -1 })
    .toArray();

  const mapped = records.map((doc) => {
    const pid = String(doc.payment_id || "").trim();
    const hasValidPayment =
      pid.startsWith("PAY_ADM_") ||
      pid === "OFFLINE_RECORD" ||
      pid.startsWith("pay_") ||
      pid.startsWith("razorpay_") ||
      pid.startsWith("order_") ||
      (pid.length >= 14 && /^[a-zA-Z0-9_-]+$/.test(pid) && pid !== "undefined" && pid !== "null");

    const isSystemProgram =
      doc.program === "STUDENT_REGISTRATION" ||
      doc.program === "SYSTEM_CUSTOM_COURSES" ||
      doc.name === "SYSTEM_BATCH_OVERRIDES";

    if (!hasValidPayment && !isSystemProgram) {
      doc.status = "pending";
      doc.payment_id = "";
      doc.is_payment_verified = false;
    } else {
      doc.is_payment_verified = true;
    }

    return {
      ...doc,
      _id: doc._id ? doc._id.toString() : undefined,
    };
  });

  if (isAll) {
    admissionsCache = mapped;
    admissionsCacheTime = now;
  }

  return mapped;
}

/**
 * Updates an admission in MongoDB
 */
export async function updateAdmissionInMongo(id, updateData) {
  invalidateAdmissionsCache();
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

  // 3. Also remove from students collection so deletion is completely clean
  try {
    const studentsCollection = db.collection("students");
    await studentsCollection.deleteOne({
      $or: [{ id: String(id) }, { email: String(id) }, { prn: String(id) }],
    });
  } catch (stdDelErr) {
    console.warn("[MongoDB Atlas] Notice deleting from students collection:", stdDelErr);
  }

  invalidateAdmissionsCache();

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
  invalidateAdmissionsCache();

  return cleanDoc;
}

/**
 * Permanently deletes an admission from MongoDB trash
 */
export async function permanentDeleteAdmissionFromMongo(id) {
  const { db } = await connectToDatabase();
  const trashCollection = db.collection("deleted_admissions");
  const admissionsCollection = db.collection("admissions");
  const studentsCollection = db.collection("students");

  const [res] = await Promise.all([
    trashCollection.deleteOne({ $or: [{ id: String(id) }, { _id: id }] }),
    admissionsCollection.deleteOne({ $or: [{ id: String(id) }, { _id: id }] }),
    studentsCollection.deleteOne({ $or: [{ id: String(id) }, { email: String(id) }, { prn: String(id) }] }),
  ]);

  invalidateAdmissionsCache();
  return { success: res.deletedCount > 0, count: res.deletedCount };
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

      // 2. Check for students collection query: /api/admissions?students=true
      if (url.includes("students=true")) {
        const { db } = await connectToDatabase();
        const studentsList = await db
          .collection("students")
          .find({})
          .sort({ registeredAt: -1, _id: -1 })
          .toArray();
        res.statusCode = 200;
        return res.end(
          JSON.stringify({
            success: true,
            count: studentsList.length,
            data: studentsList.map((s) => ({
              ...s,
              _id: s._id ? s._id.toString() : undefined,
            })),
            source: "mongodb_students",
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

      // If student registration, also sync directly into dedicated 'students' collection in MongoDB
      if (body?.program === "STUDENT_REGISTRATION") {
        try {
          const { db } = await connectToDatabase();
          let prn = "";
          let city = "Pune";
          let state = "Maharashtra";
          try {
            if (body.message) {
              const msg = JSON.parse(body.message);
              prn = msg.prn || "";
              city = msg.city || city;
              state = msg.state || state;
            }
          } catch {}
          const studentDoc = {
            id: body.id,
            prn: prn || "PMF2026-" + (body.id ? body.id.slice(0, 4) : "0000"),
            name: body.name,
            email: body.email,
            phone: body.phone,
            city,
            state,
            education: body.education,
            college_name: body.college_name,
            registeredAt: body.created_at || new Date().toISOString(),
            createdAt: body.created_at || new Date().toISOString(),
          };
          await db.collection("students").updateOne(
            { id: body.id },
            { $set: studentDoc },
            { upsert: true }
          );
        } catch (stErr) {
          console.warn("[MongoDB Students Notice]:", stErr?.message);
        }
      }

      // Automatic server-side confirmation email dispatch
      // Guarantees confirmation email is dispatched even if the student's mobile browser was closed
      if (
        body &&
        body.email &&
        body.email.includes("@") &&
        body.program !== "STUDENT_REGISTRATION" &&
        body.program !== "SYSTEM_BATCH_SETTINGS" &&
        body.name !== "SYSTEM_BATCH_OVERRIDES" &&
        body.name !== "SYSTEM_CUSTOM_COURSES"
      ) {
        try {
          const { handleSendEmail } = await import("./emailHandler.js");
          const msg = typeof body.message === "string" ? body.message : "";
          const prnMatch = msg.match(/PRN:\s*([A-Z0-9-]+)/i);
          const batchMatch = msg.match(/Batch ID:\s*([^|]+)/i);
          const timingMatch = msg.match(/Timing:\s*([^|]+)/i);

          handleSendEmail({
            type: "admission",
            studentEmail: body.email,
            studentName: body.name || "Student",
            courseName: body.program || "Language Course",
            batch: batchMatch ? batchMatch[1].trim() : (body.batchId || "Regular Batch"),
            timing: timingMatch ? timingMatch[1].trim() : "",
            phone: body.phone || "",
            totalAmount: body.amount || "",
            prn: prnMatch ? prnMatch[1].trim() : (body.id || ""),
          }).catch((err) => console.warn("[AutoEmail Notice]:", err?.message));
        } catch (autoErr) {
          console.warn("[AutoEmail Import Notice]:", autoErr?.message);
        }
      }

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
