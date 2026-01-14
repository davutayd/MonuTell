import { sql } from "@vercel/postgres";
import { put } from "@vercel/blob";
import { IncomingForm } from "formidable";
import { readFileSync } from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

// Parse form data using formidable
function parseForm(request) {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    form.parse(request, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
}

export default async function handler(request, response) {
  // Only allow POST
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fields, files } = await parseForm(request);

    // Formidable returns arrays for fields, get first value
    const type = Array.isArray(fields.type) ? fields.type[0] : fields.type;
    const targetMonumentId = Array.isArray(fields.targetMonumentId)
      ? fields.targetMonumentId[0]
      : fields.targetMonumentId;
    const payload = Array.isArray(fields.payload)
      ? fields.payload[0]
      : fields.payload;

    // Get the uploaded file
    const imageFile = files.image?.[0] || files.image;

    console.log("Parsed - type:", type, "targetMonumentId:", targetMonumentId);
    console.log("File:", imageFile ? imageFile.originalFilename : "none");

    // Validate required fields
    if (!type || !["photo_upload", "new_place"].includes(type)) {
      return response.status(400).json({
        error: "Invalid type. Must be 'photo_upload' or 'new_place'",
      });
    }

    // For photo_upload, targetMonumentId is required
    if (type === "photo_upload" && !targetMonumentId) {
      return response.status(400).json({
        error: "targetMonumentId is required for photo_upload",
      });
    }

    // For new_place, payload is required
    if (type === "new_place" && !payload) {
      return response.status(400).json({
        error: "payload is required for new_place",
      });
    }

    // Image is required for both types
    if (!imageFile) {
      return response.status(400).json({
        error: "Image file is required",
      });
    }

    // Read the file and upload to Vercel Blob
    const fileBuffer = readFileSync(imageFile.filepath);
    const timestamp = Date.now();
    const sanitizedFilename = (imageFile.originalFilename || "image.jpg").replace(
      /[^a-zA-Z0-9.-]/g,
      "_"
    );
    const blobPath = `images/${timestamp}_${sanitizedFilename}`;

    const blob = await put(blobPath, fileBuffer, {
      access: "public",
      contentType: imageFile.mimetype || "image/jpeg",
    });

    // Parse payload if provided
    let parsedPayload = null;
    if (payload) {
      try {
        parsedPayload = JSON.parse(payload);
      } catch {
        return response.status(400).json({
          error: "Invalid payload JSON",
        });
      }
    }

    // Insert into submissions table
    const result = await sql`
      INSERT INTO submissions (type, target_monument_id, image_url, payload)
      VALUES (
        ${type}::submission_type,
        ${type === "photo_upload" ? parseInt(targetMonumentId) : null},
        ${blob.url},
        ${parsedPayload ? JSON.stringify(parsedPayload) : null}::jsonb
      )
      RETURNING id, type, status, image_url, created_at;
    `;

    return response.status(201).json({
      success: true,
      submission: result.rows[0],
    });
  } catch (error) {
    console.error("Submission error:", error);
    return response.status(500).json({
      error: "Failed to process submission: " + error.message,
    });
  }
}
