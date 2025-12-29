import { sql } from "@vercel/postgres";

export default async function handler(request, response) {
  try {
    const { rows } = await sql`SELECT * FROM monuments;`;

    const formattedMonuments = rows.map((row) => ({
      id: row.id,
      category: row.category,
      name_tr: row.name_tr,
      name_en: row.name_en,
      latitude: row.latitude,
      longitude: row.longitude,
      story_tr: row.story_tr,
      story_en: row.story_en,
      address: row.address,
      image: row.image_url,
      audio: {
        tr: row.audio_tr,
        en: row.audio_en,
      },
    }));
    response.setHeader("Cache-Control", "no-store");

    return response.status(200).json({ monuments: formattedMonuments });
  } catch (error) {
    console.error("Veri çekme hatası:", error);
    return response
      .status(500)
      .json({ error: "Veriler yüklenemedi: " + error.message });
  }
}
