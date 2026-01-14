import { sql } from "@vercel/postgres";

// Simple admin authentication check
function checkAdminAuth(request, response) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error("ADMIN_PASSWORD not configured in environment");
    response.status(500).json({ error: "Admin authentication not configured" });
    return false;
  }

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
  // Only allow POST
  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  // Check admin authentication
  if (!checkAdminAuth(request, response)) {
    return;
  }

  try {
    // Get submission ID from URL path
    const { id } = request.query;

    if (!id || isNaN(parseInt(id))) {
      return response.status(400).json({ error: "Valid submission ID required" });
    }

    const submissionId = parseInt(id);

    // Fetch the submission
    const submissionResult = await sql`
      SELECT id, type, status, target_monument_id, image_url, payload
      FROM submissions
      WHERE id = ${submissionId};
    `;

    if (submissionResult.rows.length === 0) {
      return response.status(404).json({ error: "Submission not found" });
    }

    const submission = submissionResult.rows[0];

    // Check if already processed
    if (submission.status !== "pending") {
      return response.status(400).json({
        error: `Submission already ${submission.status}`,
      });
    }

    // Process based on submission type
    if (submission.type === "photo_upload") {
      // Update the monument's image_url
      if (!submission.target_monument_id) {
        return response.status(400).json({
          error: "No target monument ID for photo upload",
        });
      }

      await sql`
        UPDATE monuments
        SET image_url = ${submission.image_url}
        WHERE id = ${submission.target_monument_id};
      `;
    } else if (submission.type === "new_place") {
      // Insert new monument from payload
      const payload = submission.payload;

      if (!payload) {
        return response.status(400).json({
          error: "No payload data for new place",
        });
      }

      await sql`
        INSERT INTO monuments (
          name_en, name_tr, name_hu,
          story_en, story_tr, story_hu,
          category, address,
          latitude, longitude,
          image_url, is_audited
        ) VALUES (
          ${payload.name_en || null},
          ${payload.name_tr || null},
          ${payload.name_hu || null},
          ${payload.story_en || null},
          ${payload.story_tr || null},
          ${payload.story_hu || null},
          ${payload.category || "landmark"},
          ${payload.address || null},
          ${payload.latitude || null},
          ${payload.longitude || null},
          ${submission.image_url},
          TRUE
        );
      `;
    }

    // Update submission status to approved
    await sql`
      UPDATE submissions
      SET status = 'approved'::submission_status
      WHERE id = ${submissionId};
    `;

    return response.status(200).json({
      success: true,
      message: `Submission ${submissionId} approved successfully`,
      type: submission.type,
    });
  } catch (error) {
    console.error("Error approving submission:", error);
    return response.status(500).json({
      error: "Failed to approve submission: " + error.message,
    });
  }
}
