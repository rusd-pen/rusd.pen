import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize GoogleGenAI to prevent startup crash if key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required but not configured in environmental variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// ==========================================
// API ENDPOINTS FOR GEMINI AI SERVICES
// ==========================================

// AI Smart Search Endpoint
app.post("/api/smart-search", async (req, res) => {
  try {
    const { query, materials = [], articles = [] } = req.body;

    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Query pencarian tidak boleh kosong." });
    }

    const ai = getAiClient();

    // Prepare a simplified dataset for Gemini context to stay well within token limits
    const materialsContext = materials.map((m: any) => ({
      id: m.id,
      title: m.title,
      description: m.description || "",
      type: "material"
    }));

    const articlesContext = articles.map((a: any) => ({
      id: a.id,
      title: a.title,
      excerpt: a.excerpt || "",
      contentSample: a.content ? a.content.substring(0, 300) : "",
      type: "article"
    }));

    const dataContextStr = JSON.stringify({ materials: materialsContext, articles: articlesContext });

    const prompt = `Anda adalah asisten pencarian pintar perpustakaan Al-Azhar Syariah Islamiyyah. 
Tugas Anda adalah memproses kueri pencarian pengguna dalam bahasa Indonesia: "${query}".
Gunakan kumpulan data berikut untuk menganalisis dokumen mana yang paling relevan dengan kueri pengguna:
${dataContextStr}

Instruksi:
1. Berikan jawaban singkat (2-3 kalimat) dalam bahasa Indonesia yang meringkas temuan atau menjawab kueri berdasarkan dokumen yang ada. Jika tidak ada dokumen yang relevan, jelaskan dengan ramah.
2. Berikan peringkat relevansi untuk masing-masing dokumen yang memiliki keterkaitan dengan kata kunci atau topik pencarian. Nilai relevansi yang diperbolehkan adalah: 'Sangat Relevan', 'Cukup Relevan', atau 'Kurang Relevan'.
3. Sertakan alasan singkat mengapa dokumen tersebut relevan dengan pencarian pengguna.
4. Pastikan respons Anda mengikuti struktur skema JSON yang diberikan.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: { 
              type: Type.STRING, 
              description: "Jawaban ringkas dalam bahasa Indonesia atas pertanyaan pencarian pengguna berdasarkan data yang tersedia." 
            },
            rankings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "ID dari dokumen (materi atau artikel)." },
                  type: { type: Type.STRING, description: "Tipe dokumen, bisa berupa 'material' atau 'article'." },
                  relevance: { type: Type.STRING, description: "Tingkat relevansi: 'Sangat Relevan', 'Cukup Relevan', atau 'Kurang Relevan'." },
                  reason: { type: Type.STRING, description: "Alasan singkat mengapa dokumen ini relevan dalam bahasa Indonesia." }
                },
                required: ["id", "type", "relevance", "reason"]
              },
              description: "Daftar dokumen yang memiliki relevansi dengan pencarian pengguna."
            }
          },
          required: ["answer", "rankings"]
        }
      }
    });

    const resultText = response.text || "{}";
    const resultJson = JSON.parse(resultText);
    res.json(resultJson);

  } catch (error: any) {
    console.error("Kesalahan Smart Search:", error);
    res.status(500).json({ 
      error: "Gagal memproses pencarian pintar AI.", 
      details: error.message || String(error) 
    });
  }
});

// AI Summarization Endpoint
app.post("/api/summarize", async (req, res) => {
  try {
    const { type, id, title, content } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Judul konten diperlukan untuk ringkasan." });
    }

    const ai = getAiClient();

    const prompt = `Anda adalah pakar akademik Al-Azhar Syariah Islamiyyah. 
Buatlah ringkasan studi (talkhis) yang mendalam, berstruktur rapi, akademis, dan mudah dipahami dalam Bahasa Indonesia untuk dokumen berikut:
Tipe: ${type === "material" ? "Materi Kuliah / Diktat" : "Artikel Ilmiah"}
Judul: ${title}
Isi/Deskripsi: ${content || "Tidak ada deskripsi rinci."}

Gunakan format Markdown untuk menyusun ringkasan dengan elemen berikut:
1. **Intisari Utama (Executive Summary)**: Penjelasan singkat 2-3 kalimat mengenai materi ini.
2. **Poin-Poin Kunci (Core Points)**: Penjelasan berbutir (bullet points) mengenai sub-topik terpenting, argumentasi madzhab (jika ada), atau aspek hukum yang dibahas.
3. **Kosakata Penting (Key Vocabulary)**: Glosarium istilah-istilah Arab/fikh/shariah yang relevan beserta definisinya.
4. **Referensi Klasik / Dalil (Classical References)**: Dalil Al-Quran, hadits, atau kitab kuning yang mendasari ulasan materi ini jika dapat diidentifikasi.

Tuliskan ringkasan dengan gaya bahasa yang sopan, ilmiah, dan berwibawa khas akademisi Universitas Al-Azhar Kairo.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ summary: response.text || "Tidak dapat membuat ringkasan." });

  } catch (error: any) {
    console.error("Kesalahan Ringkasan AI:", error);
    res.status(500).json({ 
      error: "Gagal membuat ringkasan berbasis AI.", 
      details: error.message || String(error) 
    });
  }
});

// ==========================================
// VITE DEV SERVER & STATIC ASSETS HANDLERS
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT} under environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer();
