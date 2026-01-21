import { GoogleGenerativeAI } from "@google/generative-ai";
import pg from "pg";
import dotenv from "dotenv";
import readline from "readline";
import { put, list } from "@vercel/blob";
import sdk from "microsoft-cognitiveservices-speech-sdk";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const VOICE_POOL = {
  EN: ["en-US-BrianNeural", "en-US-JennyNeural"],
  TR: ["tr-TR-AhmetNeural", "tr-TR-EmelNeural"],
  HU: ["hu-HU-TamasNeural", "hu-HU-NoemiNeural"],
};

let SELECTED_MODEL_NAME = "";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: { rejectUnauthorized: false },
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function runProCreatorAutoArchitect() {
  console.log(`\n🔄  MONUTELL V19 - AUTO SYNC EDITOR 🔄`);
  console.log(
    `------------------------------------------------------------------`,
  );
  await detectBestModel();
  await prepareDatabase();
  askForInput();
}

async function detectBestModel() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
    );
    const data = await response.json();
    const availableModels = data.models
      .filter((m) => m.supportedGenerationMethods.includes("generateContent"))
      .map((m) => m.name.replace("models/", ""));
    let bestMatch = availableModels.find((m) => m.includes("gemini-1.5-flash"));
    if (!bestMatch) bestMatch = availableModels[0];
    SELECTED_MODEL_NAME = bestMatch;
    console.log(`✅ MODEL: [ ${SELECTED_MODEL_NAME} ]`);
  } catch (error) {
    SELECTED_MODEL_NAME = "gemini-1.5-flash";
  }
}

async function prepareDatabase() {
  try {
    await pool.query(
      "ALTER TABLE monuments ADD COLUMN IF NOT EXISTS name_hu TEXT;",
    );
  } catch (e) {}
  try {
    await pool.query(
      "ALTER TABLE monuments ADD COLUMN IF NOT EXISTS story_hu TEXT;",
    );
  } catch (e) {}
  try {
    await pool.query(
      "ALTER TABLE monuments ADD COLUMN IF NOT EXISTS audio_hu TEXT;",
    );
  } catch (e) {}
}

function askForInput() {
  rl.question('\n🏛️  Enter Place Name (Exit: "exit"): ', (inputName) => {
    if (inputName.toLowerCase() === "exit") {
      pool.end();
      process.exit(0);
    }
    if (!inputName.trim()) return askForInput();

    rl.question("📍  Coordinates (or leave empty): ", async (inputCoords) => {
      console.log(`🤖 Drafting content...`);
      try {
        const imageUrl = await getWikiImage(inputName);
        const data = await generateArchitectDataWithRetry(
          inputName,
          inputCoords,
        );

        if (!data.found) {
          console.log(`⛔ Not Found: ${data.reason}`);
          return askForInput();
        }

        data.image_url = imageUrl;
        reviewAndEdit(data);
      } catch (error) {
        console.log(`💥 Error: ${error.message}`);
        askForInput();
      }
    });
  });
}

// --- 🛠️ UPDATE: DETAILED SUMMARY SCREEN (ENGLISH) ---
function reviewAndEdit(data) {
  console.log(`\n================== 🧐 DRAFT REVIEW ==================`);
  console.log(`🏷️  NAME (EN): ${data.name_en}`);
  console.log(`🏷️  NAME (TR): ${data.name_tr}`);
  console.log(`🏷️  NAME (HU): ${data.name_hu}`);
  console.log(`--------------------------------------------------------`);
  console.log(`🏠  ADDRESS:     ${data.address}`);
  console.log(`📍  LOCATION:    ${data.latitude}, ${data.longitude}`);
  console.log(`🖼️  IMAGE:       ${data.image_url ? "✅ Found" : "❌ Missing"}`);

  console.log(`\n--- 🇬🇧 ENGLISH STORY ---`);
  console.log(data.story_en);

  console.log(`\n--- 🇹🇷 TURKISH STORY ---`);
  console.log(data.story_tr);

  console.log(`\n--- 🇭🇺 HUNGARIAN STORY ---`);
  console.log(data.story_hu);
  console.log(`========================================================`);

  console.log(`\n[e] ✅ PERFECT - Save`);
  console.log(`[d] ✏️ EDIT - Change one (Others update automatically!)`);
  console.log(`[i] ❌ CANCEL`);

  rl.question("\nWhat is your decision? (e/d/i): ", (ans) => {
    const choice = ans.trim().toLowerCase();

    if (choice === "e") {
      produceAndSave(data);
    } else if (choice === "d") {
      openEditor(data);
    } else {
      console.log("🗑️  Cancelled.");
      askForInput();
    }
  });
}
// -----------------------------------------------------

function openEditor(data) {
  console.log(
    `\n--- WHICH ONE TO EDIT? (Others will translate accordingly) ---`,
  );
  console.log(`1. Names (Manual)`);
  console.log(`2. Story (EN) -> Auto updates TR & HU`);
  console.log(`3. Story (TR) -> Auto updates EN & HU`);
  console.log(`4. Story (HU) -> Auto updates EN & TR`);
  console.log(`5. Cancel`);

  rl.question("Choice (1-5): ", (fieldChoice) => {
    if (fieldChoice === "5") return reviewAndEdit(data);

    if (fieldChoice === "1") {
      rl.question("New English Name: ", (nEn) => {
        if (nEn) data.name_en = nEn;
        rl.question("New Hungarian Name: ", (nHu) => {
          if (nHu) data.name_hu = nHu;
          reviewAndEdit(data);
        });
      });
      return;
    }

    rl.question("\n📝 Paste/Write new story: ", async (newText) => {
      if (!newText.trim()) return openEditor(data);

      console.log("🔄 AI is updating other languages...");

      const contextName = data.name_en;

      try {
        if (fieldChoice === "2") {
          data.story_en = newText;
          const res = await smartTranslate(
            newText,
            "English",
            ["Turkish", "Hungarian"],
            contextName,
          );
          data.story_tr = res.Turkish;
          data.story_hu = res.Hungarian;
        } else if (fieldChoice === "3") {
          data.story_tr = newText;
          const res = await smartTranslate(
            newText,
            "Turkish",
            ["English", "Hungarian"],
            contextName,
          );
          data.story_en = res.English;
          data.story_hu = res.Hungarian;
        } else if (fieldChoice === "4") {
          data.story_hu = newText;
          const res = await smartTranslate(
            newText,
            "Hungarian",
            ["English", "Turkish"],
            contextName,
          );
          data.story_en = res.English;
          data.story_tr = res.Turkish;
        }

        console.log("✅ All languages synchronized!");
        reviewAndEdit(data);
      } catch (e) {
        console.log("❌ Translation error: " + e.message);
        reviewAndEdit(data);
      }
    });
  });
}

async function smartTranslate(
  sourceText,
  sourceLang,
  targetLangs,
  contextName,
) {
  const modelName = SELECTED_MODEL_NAME || "gemini-1.5-flash";
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `
      You are a professional translator for a Travel Audio Guide.
      
      CONTEXT: This is a story about the landmark "${contextName}".
      SOURCE TEXT (${sourceLang}): "${sourceText}"
      
      TASK: Translate this text into: ${targetLangs.join(" and ")}.
      
      STYLE:
      - Keep the exact meaning of the source text.
      - Maintain the "Audio Guide" tone (Engaging, direct).
      - Do not add new information, just translate the user's edit.
      
      OUTPUT JSON ONLY (Keys: ${targetLangs.join(", ")}):
      {
        "${targetLangs[0]}": "...",
        "${targetLangs[1]}": "..."
      }
    `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("JSON generation failed.");
  return JSON.parse(jsonMatch[0]);
}

async function generateArchitectData(query, inputCoords) {
  const model = genAI.getGenerativeModel({ model: SELECTED_MODEL_NAME });
  let coordInstruction =
    inputCoords && inputCoords.length > 5
      ? `USE COORDS: [${inputCoords}]`
      : "Find coords.";

  const prompt = `
    You are 'The Architect' - a Premium Travel Content Engine.
    USER QUERY: "${query}"
    ${coordInstruction}

    --- PHASE 1: THE FILTER ---
    Analyze the location.
    REJECT (found: false) IF: Generic cafe/shop, modern office, insignificant spot.
    ACCEPT (found: true) IF: Historical landmark, cultural site, hidden gem, architectural marvel.

    --- PHASE 2: CONTENT CREATION ---
    1. **Identity:** Official Name & Address.
    2. **Story:** Immersive audio guide script.
        - Length: 9-12 sentences.
        - Tone: Direct, engaging, and grounded. NO "fairy tale" or flowery introductions.
        - Structure: Start IMMEDIATELY with physical context (where the user is standing) or the building's original function.
        - Content: Visuals + History + Emotion (without exaggeration).
    3. **Translation (TR):** High-quality Turkish translation.
    4. **Translation (HU):** High-quality Hungarian translation (Native, natural).

    OUTPUT JSON ONLY:
    {
      "found": true,
      "name_en": "Official Name",
      "name_tr": "Official Turkish Name",
      "name_hu": "Official Hungarian Name",
      "category": "statue|museum|landmark|bridge|church|castle",
      "address": "Full Address String",
      "latitude": 47.1234,
      "longitude": 19.1234,
      "story_en": "...",
      "story_tr": "...",
      "story_hu": "..."
    }
    OR { "found": false, "reason": "..." }
  `;

  const result = await model.generateContent(prompt);
  const jsonMatch = result.response.text().match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("JSON not found.");
  return JSON.parse(jsonMatch[0]);
}

async function produceAndSave(data) {
  console.log(`\n⚙️  PRODUCTION STARTED...`);
  const genderIndex = Math.floor(Math.random() * 2);
  const voiceEN = VOICE_POOL.EN[genderIndex];
  const voiceTR = VOICE_POOL.TR[genderIndex];
  const voiceHU = VOICE_POOL.HU[genderIndex];

  const uploadOrSkip = async (filename, buffer) => {
    const { blobs } = await list({ prefix: filename, limit: 1 });
    if (blobs.length > 0) return blobs[0];
    return await put(filename, buffer, { access: "public" });
  };

  try {
    const bufEn = await textToSpeechAzure(data.story_en, voiceEN);
    const bufTr = await textToSpeechAzure(data.story_tr, voiceTR);
    const bufHu = await textToSpeechAzure(data.story_hu, voiceHU);

    const cleanName = data.name_en
      .replace(/[^a-zA-Z0-9]/g, "_")
      .substring(0, 50);
    const blobEn = await uploadOrSkip(`${cleanName}_EN.mp3`, bufEn);
    const blobTr = await uploadOrSkip(`${cleanName}_TR.mp3`, bufTr);
    const blobHu = await uploadOrSkip(`${cleanName}_HU.mp3`, bufHu);

    const res = await pool.query(
      `INSERT INTO monuments (name_en, name_tr, name_hu, category, address, latitude, longitude, story_en, story_tr, story_hu, image_url, audio_en, audio_tr, audio_hu, is_audited) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, TRUE) RETURNING id;`,
      [
        data.name_en,
        data.name_tr,
        data.name_hu,
        data.category,
        data.address,
        data.latitude,
        data.longitude,
        data.story_en,
        data.story_tr,
        data.story_hu,
        data.image_url,
        blobEn.url,
        blobTr.url,
        blobHu.url,
      ],
    );

    console.log(`🎉 SAVED! (ID: ${res.rows[0].id})`);
    askForInput();
  } catch (e) {
    console.log(`💥 Error: ${e.message}`);
    askForInput();
  }
}

async function generateArchitectDataWithRetry(q, c, a = 1) {
  try {
    return await generateArchitectData(q, c);
  } catch (e) {
    if (a > 3) throw e;
    console.log("⚠️ Retrying...");
    return generateArchitectDataWithRetry(q, c, a + 1);
  }
}

async function getWikiImage(query) {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        query + " Budapest",
      )}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.thumbnail?.source || null;
  } catch {
    return null;
  }
}

async function textToSpeechAzure(text, voiceName) {
  return new Promise((resolve, reject) => {
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.SPEECH_KEY,
      process.env.SPEECH_REGION,
    );
    speechConfig.speechSynthesisVoiceName = voiceName;
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);
    synthesizer.speakTextAsync(
      text,
      (res) => {
        if (res.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          resolve(Buffer.from(res.audioData));
          synthesizer.close();
        } else {
          synthesizer.close();
          reject(new Error(res.errorDetails));
        }
      },
      (err) => {
        synthesizer.close();
        reject(err);
      },
    );
  });
}

runProCreatorAutoArchitect();
