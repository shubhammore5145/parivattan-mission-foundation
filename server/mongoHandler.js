import { MongoClient, ObjectId } from "mongodb";
import fs from "fs";
import path from "path";
import dns from "node:dns";
if (typeof dns?.setDefaultResultOrder === "function") {
  try {
    dns.setDefaultResultOrder("ipv4first");
  } catch {}
}
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
const ADMISSIONS_CACHE_TTL = 60000; // 60 seconds (invalidated immediately on write)

export function invalidateAdmissionsCache() {
  admissionsCache = null;
  admissionsCacheTime = 0;
}

// Reliable MongoDB Atlas production connection URI for live serverless deployments
const DEFAULT_MONGODB_URI =
  "mongodb+srv://parivattan_db_user:dkLApAbS0Vl53lv2@parivattan.z9nfyyy.mongodb.net/parivattan_db?retryWrites=true&w=majority";

/**
 * Reads MongoDB URI and DB Name from environment or .env file fallback
 */
export function getMongoConfig() {
  let uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;
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
        serverSelectionTimeoutMS: 6000,
        connectTimeoutMS: 6000,
      });

      await client.connect();
      const db = client.db(dbName || undefined);

      cachedClient = client;
      cachedDb = db;

      // Ensure indexes in background for high performance
      try {
        db.collection("admissions").createIndex({ created_at: -1 }, { background: true }).catch(() => {});
        db.collection("admissions").createIndex({ email: 1 }, { background: true }).catch(() => {});
        db.collection("admissions").createIndex({ phone: 1 }, { background: true }).catch(() => {});
        db.collection("admissions").createIndex({ id: 1 }, { background: true }).catch(() => {});
        db.collection("visitors").createIndex({ created_at: -1 }, { background: true }).catch(() => {});
        db.collection("visitors").createIndex({ session_id: 1 }, { background: true }).catch(() => {});
      } catch {}

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

  const pid = String(admissionData.payment_id || "").trim();
  const resolvedStatus = admissionData.status || (pid ? "completed" : "pending");
  const resolvedPaymentId = pid;

  const record = {
    ...admissionData,
    status: resolvedStatus,
    payment_id: resolvedPaymentId,
    is_payment_verified: !!pid,
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
 * Preserves message attachments and JSON strings intact so student credentials,
 * PRN numbers, and documents are never corrupted or stripped.
 */
function sanitizeMessageAttachments(message) {
  return message;
}

/**
 * Retrieves admissions from MongoDB (preserves all documents, photos, marksheets, and metadata)
 */
export async function getAdmissionsFromMongo(query = {}, options = {}) {
  const isAll = Object.keys(query).length === 0;
  const isFresh = !!options.fresh || !!options.forceFresh;
  const isFull = !!options.full;
  const now = Date.now();

  if (isAll && !isFresh && !isFull && admissionsCache && now - admissionsCacheTime < ADMISSIONS_CACHE_TTL) {
    return admissionsCache;
  }

  const { db } = await connectToDatabase();
  const collection = db.collection("admissions");

  // Fetch all admissions. When loading list (!isFull), project out heavy binary/base64 strings
  // so that the entire dataset transfers in <1.5s instead of 44s, preventing timeout drops.
  const cursor = collection.find(query);
  if (!isFull) {
    cursor.project({
      photo: 0,
      photoUrl: 0,
      photoDataUrl: 0,
      identity_proof: 0,
      identityProofUrl: 0,
      education_proof: 0,
      marksheetUrl: 0,
      caste_certificate: 0,
      casteCertUrl: 0,
    });
  }

  const records = await cursor
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

    doc.is_payment_verified = hasValidPayment || isSystemProgram || doc.status === "completed";

    const createdAt =
      doc.created_at ||
      (doc._createdAt ? new Date(doc._createdAt).toISOString() : undefined) ||
      (doc.registeredAt ? new Date(doc.registeredAt).toISOString() : undefined) ||
      new Date().toISOString();

    return {
      ...doc,
      created_at: createdAt,
      message: doc.message,
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
 * Retrieves a single admission from MongoDB with full attachments/base64 files
 */
export async function getAdmissionByIdFromMongo(id) {
  if (!id) return null;
  const { db } = await connectToDatabase();
  const collection = db.collection("admissions");

  const doc = await collection.findOne({
    $or: [{ id: String(id) }, { _id: id }],
  });

  if (!doc) return null;

  return {
    ...doc,
    _id: doc._id ? doc._id.toString() : undefined,
  };
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
 * Supports multiple identifiers (id, ObjectId, email, payment_id, prn) for bulletproof deletion.
 */
export async function deleteAdmissionFromMongo(id, options = {}) {
  const { db } = await connectToDatabase();
  const collection = db.collection("admissions");
  const trashCollection = db.collection("deleted_admissions");
  const studentsCollection = db.collection("students");

  const cleanId = String(id || "").trim();
  const cleanEmail = String(options.email || "").trim().toLowerCase();
  const cleanPrn = String(options.prn || "").trim();
  const cleanPaymentId = String(options.payment_id || "").trim();

  const orList = [];
  if (cleanId) {
    orList.push({ id: cleanId });
    if (cleanId.length === 24 && /^[0-9a-fA-F]{24}$/.test(cleanId)) {
      try {
        orList.push({ _id: new ObjectId(cleanId) });
      } catch {}
    }
  }
  if (cleanPaymentId && cleanPaymentId !== "OFFLINE_RECORD" && !cleanPaymentId.startsWith("PAY_ADM_")) {
    orList.push({ payment_id: cleanPaymentId });
  }
  if (options.isStudent && cleanEmail) {
    orList.push({ email: cleanEmail, program: "STUDENT_REGISTRATION" });
  }

  const query = orList.length > 0 ? { $or: orList } : { id: cleanId };

  // 1. Archive to deleted_admissions before deleting
  try {
    const existingList = await collection.find(query).toArray();
    for (const existing of existingList) {
      const cleanDoc = { ...existing };
      delete cleanDoc._id; // prevent duplicate _id conflict
      await trashCollection.updateOne(
        { id: cleanDoc.id || cleanId },
        {
          $set: {
            ...cleanDoc,
            id: cleanDoc.id || cleanId,
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
  const result = await collection.deleteMany(query);

  // 3. Also remove from students collection so deletion is completely clean
  try {
    const stdOrList = [];
    if (cleanId) stdOrList.push({ id: cleanId }, { prn: cleanId });
    if (cleanEmail) stdOrList.push({ email: cleanEmail });
    if (cleanPrn) stdOrList.push({ prn: cleanPrn });
    if (stdOrList.length > 0) {
      await studentsCollection.deleteMany({ $or: stdOrList });
    }
  } catch (stdDelErr) {
    console.warn("[MongoDB Atlas] Notice deleting from students collection:", stdDelErr);
  }

  invalidateAdmissionsCache();

  return { success: (result.deletedCount || 0) > 0, count: result.deletedCount || 0 };
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

      // 3. Parse query parameters for high-speed filtered queries and single-document fetches
      const parsedUrl = new URL(url.startsWith("http") ? url : `http://localhost${url}`);
      const isFull = parsedUrl.searchParams.get("full") === "true";
      const targetId = parsedUrl.searchParams.get("id");
      const targetEmail = parsedUrl.searchParams.get("email");
      const targetPhone = parsedUrl.searchParams.get("phone");

      // Single admission lookup by ID (e.g. for document viewing or verification)
      if (targetId) {
        const singleDoc = await getAdmissionByIdFromMongo(targetId);
        if (!singleDoc) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ success: false, error: "Admission not found" }));
        }
        res.statusCode = 200;
        return res.end(JSON.stringify({ success: true, data: singleDoc, source: "mongodb" }));
      }

      // Filter by email (e.g. student portal loading their own applications in <20ms)
      if (targetEmail) {
        const cleanEmail = targetEmail.trim().toLowerCase();
        const userAdmissions = await getAdmissionsFromMongo(
          { email: { $regex: new RegExp(`^${cleanEmail}$`, "i") } },
          { full: isFull }
        );
        res.statusCode = 200;
        return res.end(
          JSON.stringify({
            success: true,
            count: userAdmissions.length,
            data: userAdmissions,
            source: "mongodb_filtered_email",
          })
        );
      }

      // Filter by phone
      if (targetPhone) {
        const cleanPhone = targetPhone.replace(/\D/g, "");
        const userAdmissions = await getAdmissionsFromMongo(
          { phone: { $regex: cleanPhone } },
          { full: isFull }
        );
        res.statusCode = 200;
        return res.end(
          JSON.stringify({
            success: true,
            count: userAdmissions.length,
            data: userAdmissions,
            source: "mongodb_filtered_phone",
          })
        );
      }

      // General listing (returns all admissions with complete documents and files)
      const isFresh = parsedUrl.searchParams.get("fresh") === "true";
      const admissions = await getAdmissionsFromMongo({}, { full: isFull, fresh: isFresh });
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
          let password = "";
          try {
            if (body.message) {
              const msg = JSON.parse(body.message);
              prn = msg.prn || "";
              city = msg.city || city;
              state = msg.state || state;
              password = msg.password || "";
            }
          } catch {}
          const studentDoc = {
            id: body.id,
            prn: prn || "PMF2026-" + (body.id ? body.id.slice(0, 4) : "0000"),
            name: body.name,
            email: body.email,
            phone: body.phone,
            password: password || body.password || "",
            city,
            state,
            education: body.education,
            college_name: body.college_name,
            registeredAt: body.created_at || new Date().toISOString(),
            createdAt: body.created_at || new Date().toISOString(),
          };
          // Upsert cleanly so duplicate accounts are never created for the same student
          await db.collection("students").updateOne(
            { $or: [{ id: body.id }, { email: body.email }] },
            { $set: studentDoc },
            { upsert: true }
          );

          // Clean any old trash records for this email since account is actively re-registered
          if (body.email) {
            await db.collection("deleted_admissions").deleteMany({ email: body.email }).catch(() => {});
          }
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

      const parsedDeleteUrl = new URL(url.startsWith("http") ? url : `http://localhost${url}`);
      let id = parsedDeleteUrl.searchParams.get("id") || body?.id || "";
      let email = parsedDeleteUrl.searchParams.get("email") || body?.email || "";
      let payment_id = parsedDeleteUrl.searchParams.get("payment_id") || body?.payment_id || "";
      let prn = parsedDeleteUrl.searchParams.get("prn") || body?.prn || "";
      let isStudent = parsedDeleteUrl.searchParams.get("student") === "true" || body?.student === true;

      if (!id && !email && !payment_id) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({ success: false, error: "Admission ID or identifier is required for deletion." })
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
      const result = await deleteAdmissionFromMongo(id, { email, payment_id, prn, isStudent });
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
