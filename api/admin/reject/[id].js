import { sql } from "@vercel/postgres";

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

    // Check if submission exists and is pending
    const checkResult = await sql`
      SELECT id, status FROM submissions WHERE id = ${submissionId};
    `;

    if (checkResult.rows.length === 0) {
      return response.status(404).json({ error: "Submission not found" });
    }

    if (checkResult.rows[0].status !== "pending") {
      return response.status(400).json({
        error: `Submission already ${checkResult.rows[0].status}`,
      });
    }

    // Update submission status to rejected
    await sql`
      UPDATE submissions
      SET status = 'rejected'::submission_status
      WHERE id = ${submissionId};
    `;

    return response.status(200).json({
      success: true,
      message: `Submission ${submissionId} rejected`,
    });
  } catch (error) {
    console.error("Error rejecting submission:", error);
    return response.status(500).json({
      error: "Failed to reject submission: " + error.message,
    });
  }
}
