import { sql } from "@vercel/postgres";
import crypto from "crypto";

function checkAdminAuth(request, response) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error(
      "CONFIGURATION ERROR: ADMIN_PASSWORD is missing in environment variables.",
    );
    response.status(500).json({ error: "Server configuration error" });
    return false;
  }

  const authHeader = request.headers.authorization;
  let providedPassword = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    providedPassword = authHeader.substring(7);
  }

  if (!providedPassword) {
    response.status(401).json({ error: "Unauthorized: No token provided" });
    return false;
  }

  try {
    const bufferProvided = Buffer.from(providedPassword);
    const bufferAdmin = Buffer.from(adminPassword);

    if (
      bufferProvided.length !== bufferAdmin.length ||
      !crypto.timingSafeEqual(bufferProvided, bufferAdmin)
    ) {
      response.status(401).json({ error: "Unauthorized: Invalid token" });
      return false;
    }
  } catch (error) {
    response.status(401).json({ error: "Unauthorized" });
    return false;
  }

  return true;
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  if (!checkAdminAuth(request, response)) {
    return;
  }

  try {
    const status = request.query?.status || "pending";

    const validStatuses = ["pending", "approved", "rejected", "all"];
    if (!validStatuses.includes(status)) {
      return response.status(400).json({
        error:
          "Invalid status. Must be 'pending', 'approved', 'rejected', or 'all'",
      });
    }

    let result;

    if (status === "all") {
      result = await sql`
        SELECT 
          s.id,
          s.type,
          s.status,
          s.target_monument_id,
          s.image_url,
          s.payload,
          s.created_at,
          m.name_en as monument_name
        FROM submissions s
        LEFT JOIN monuments m ON s.target_monument_id = m.id
        ORDER BY s.created_at DESC;
      `;
    } else {
      result = await sql`
        SELECT 
          s.id,
          s.type,
          s.status,
          s.target_monument_id,
          s.image_url,
          s.payload,
          s.created_at,
          m.name_en as monument_name
        FROM submissions s
        LEFT JOIN monuments m ON s.target_monument_id = m.id
        WHERE s.status = ${status}::submission_status
        ORDER BY s.created_at DESC;
      `;
    }

    return response.status(200).json({
      submissions: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Database Error:", error.message);
    return response.status(500).json({
      error: "Failed to fetch submissions",
    });
  }
}
