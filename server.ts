import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/gemini/analyze", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res
          .status(500)
          .json({
            error: "Gemini API key is missing. Please set GEMINI_API_KEY.",
          });
      }

      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Image is required" });
      }

      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Invalid image format" });
      }

      const mimeType = matches[1];
      const base64Data = matches[2];

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          "Analyze this image of a civic/local issue. Identify the problem and return the requested JSON structure.",
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "A short, formal complaint title for the issue.",
              },
              description: {
                type: Type.STRING,
                description:
                  "A detailed description of the issue based on the image.",
              },
              category: {
                type: Type.STRING,
                description:
                  "The category of the issue (e.g., Pothole, Garbage, Water Leakage, Road Damage, Broken Infrastructure, Streetlight Damage, Other)",
              },
              severity: {
                type: Type.STRING,
                description:
                  "The severity of the issue (Low, Medium, High, Critical)",
              },
              priority: {
                type: Type.STRING,
                description: "The priority to fix (Low, Medium, High, Urgent)",
              },
              department: {
                type: Type.STRING,
                description:
                  "The exact government department responsible for fixing this",
              },
              isEmergency: {
                type: Type.BOOLEAN,
                description:
                  "True if this is an emergency situation (e.g., fire, live electric wire, road collapse) requiring immediate dispatch.",
              },
              safetyPrecautions: {
                type: Type.STRING,
                description:
                  "Temporary safety precautions for citizens near the area.",
              },
              actionPlan: {
                type: Type.STRING,
                description:
                  "A recommended action plan explaining exactly what authorities should do to solve the issue.",
              },
              confidence: {
                type: Type.NUMBER,
                description: "Confidence percentage of this analysis (0-100)",
              },
              summary: {
                type: Type.STRING,
                description:
                  "A 2-sentence clear summary of what is seen in the image and its potential impact.",
              },
            },
            required: [
              "title",
              "description",
              "category",
              "severity",
              "priority",
              "department",
              "isEmergency",
              "safetyPrecautions",
              "actionPlan",
              "confidence",
              "summary",
            ],
          },
        },
      });

      const text = response.text || "{}";
      const result = JSON.parse(text);
      res.json(result);
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res
        .status(500)
        .json({ error: "Failed to analyze image", details: error.message });
    }
  });

  app.post("/api/gemini/assistant", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        return res
          .status(500)
          .json({
            error: "Gemini API key is missing. Please set GEMINI_API_KEY.",
          });
      }

      const { prompt, history } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const contents = history.map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      contents.push({ role: "user", parts: [{ text: prompt }] });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          systemInstruction: `You are the AI assistant for FIXMYAREA AI, a civic engagement platform.
Your goal is to help citizens understand their local issues, provide safety advice, explain how the reporting system works, and summarize data based on typical civic scenarios.
Answer concisely and professionally. If asked about specific database details, politely invent realistic hypothetical data to demonstrate the platform's capability, as this is a hackathon/startup demo environment.`,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res
        .status(500)
        .json({ error: "Failed to generate response", details: error.message });
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
