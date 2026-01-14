import { sql } from "@vercel/postgres";

// Simple admin authentication check
function checkAdminAuth(request, response) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  // Debug: log environment variable status
  console.log("ADMIN_PASSWORD present:", !!adminPassword);
  console.log("All env vars:", Object.keys(process.env).filter(k => k.includes('POSTGRES') || k.includes('ADMIN')));

  if (!adminPassword) {
    console.error("ADMIN_PASSWORD not configured in environment");
    response.status(500).json({ error: "Admin authentication not configured" });
    return false;
  }

  // Check for password in Authorization header (Bearer token) or query param
  const authHeader = request.headers.authorization;
  const queryPassword = request.query?.password;

  let providedPassword = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    providedPassword = authHeader.substring(7);
  } else if (queryPassword) {
    providedPassword = queryPassword;
  }

  if (providedPassword !== adminPassword) {
    response.status(401).json({ error: "Unauthorized" });
    return false;
  }

  return true;
}

export default async function handler(request, response) {
  // Only allow GET
  if (request.method !== "GET") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  // Check admin authentication
  if (!checkAdminAuth(request, response)) {
    return;
  }

  try {
    // Get status filter from query params (default: pending)
    const status = request.query?.status || "pending";

    // Validate status
    if (!["pending", "approved", "rejected", "all"].includes(status)) {
      return response.status(400).json({
        error: "Invalid status. Must be 'pending', 'approved', 'rejected', or 'all'",
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
    console.error("Error fetching submissions:", error);
    return response.status(500).json({
      error: "Failed to fetch submissions: " + error.message,
    });
  }
}
