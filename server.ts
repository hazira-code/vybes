import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";

const app = express();
const PORT = 3000;

// Body parsing with safe size limits for base64 images (user uploads, snapshots)
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Initialize Gemini SDK with telemetry User-Agent
const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: geminiApiKey || "MOCK_KEY", // Fallback for loading without crash
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// Helper: Ensure API key is configured
function checkApiKey(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: "Gemini API Key is not configured. Please add GEMINI_API_KEY in the Secrets / Environment variable settings.",
    });
  }
  next();
}

/**
 * Endpoint: /api/recommendations
 * Purpose: Generates personalized occassion-based recommendations using Gemini 3.5 Flash
 */
app.post("/api/recommendations", checkApiKey, async (req, res) => {
  try {
    const { occasion, stylePreference, targetVibe, genderPreference } = req.body;

    const systemInstruction = `You are an expert AI fashion stylist and image consultant for VYBES — "Try It Virtually. Wear It Confidently".
Provide highly-curated, personalized styling recommendations according to the user's desired occasion, style preference, vibe, and choice.
Generate fashion ideas, matching color palettes, must-have accessories, and details matching standard garments.
Structure the response as a valid, pure JSON object matching the provided schema. Do not output any backticks or markdown wraps. Only valid JSON.`;

    const userPrompt = `Generate a customized outfit suggestion list for:
- Occasion: ${occasion || "Casual Outing"}
- Style Preference: ${stylePreference || "Classic Modern"}
- Desired Vibe: ${targetVibe || "Trendy & Confidence-boosting"}
- Profile/Gender: ${genderPreference || "Unisex / Any"}

Identify exactly three distinct look variations (e.g., "The Statement", "Effortless Elegance", "Bold Experimental"). Provide color suggestions, aesthetic analysis, and footwear options.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            themeStatement: {
              type: Type.STRING,
              description: "An overall visionary styling tagline or theme statement for this occasion."
            },
            colorPalette: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of 3-5 recommended hexadecimal or clean color names that work masterfully together."
            },
            styles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  lookName: { type: Type.STRING, description: "Name of the look (e.g., Casual Sophisticate, Midnight Satin)" },
                  topChoice: { type: Type.STRING, description: "Description or pattern of top (e.g., Charcoal Tailored Blazer, Pastel Linen Shirt)" },
                  bottomChoice: { type: Type.STRING, description: "Description or matching bottom (e.g., Cream Pleated Trousers, Slim Denim Jeans)" },
                  layering: { type: Type.STRING, description: "Suggested jacket, shrug, vest or layering if any" },
                  footwear: { type: Type.STRING, description: "Perfect matching shoes" },
                  accessories: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 2-3 essential accessories (e.g., Minimalist silver watch, silk scarf)" },
                  stylingTip: { type: Type.STRING, description: "Expert pro-tip on how to tuck, sleeve roll, or carry the outfit successfully." }
                },
                required: ["lookName", "topChoice", "bottomChoice", "footwear", "accessories", "stylingTip"]
              }
            }
          },
          required: ["themeStatement", "colorPalette", "styles"]
        }
      }
    });

    const textOutput = response.text || "{}";
    res.json(JSON.parse(textOutput));
  } catch (error: any) {
    console.error("Error in /api/recommendations:", error);
    res.status(500).json({ error: error.message || "Failed to generate styling suggestions" });
  }
});

/**
 * Endpoint: /api/stylist-chat
 * Purpose: Chat with a stylized personal AI fashion consultant in real-time, taking try-on context into account
 */
app.post("/api/stylist-chat", checkApiKey, async (req, res) => {
  try {
    const { message, history, currentOutfit } = req.body;

    // Convert history format
    const chatContents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        chatContents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        });
      });
    }

    // Add current user message
    let fullUserMsg = message;
    if (currentOutfit) {
      fullUserMsg = `${message}\n\n[Current Context: User is virtually trying on a '${currentOutfit.topName || "None"}' with color '${currentOutfit.topColor || "default"}' and '${currentOutfit.bottomName || "None"}' with color '${currentOutfit.bottomColor || "default"}' under '${currentOutfit.lighting || "Daylight"}' lighting on a '${currentOutfit.modelName || "preset"}' model.]`;
    }

    chatContents.push({
      role: "user",
      parts: [{ text: fullUserMsg }]
    });

    const systemInstruction = `You are VYBES Stylist AI, an elegant, ultra-professional and friendly fashion concierge and personal wardrobe coach.
Keep your suggestions concise, actionable, and filled with taste. Use clean terminology, talk about color pairing, proportions, texture contrast, and fit.
If the user currently has clothes selected, acknowledge them in a natural, expert way (e.g. 'That slate gray linen shirt contrasts beautifully with white trousers...').
Recommend changes to fitting, size, or lighting virtual modes if applicable.
Always be positive, confidence-boosting, and professional. Avoid lengthy greeting summaries. Go straight to styling options and tips.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/stylist-chat:", error);
    res.status(500).json({ error: error.message || "Fashion consultant connection error" });
  }
});

/**
 * Endpoint: /api/analyze-look
 * Purpose: Performs a deep fashion assessment of the user's currently styled combination
 */
app.post("/api/analyze-look", checkApiKey, async (req, res) => {
  try {
    const { topName, topColor, bottomName, bottomColor, lighting, size, fitting, customImage } = req.body;

    const systemInstruction = `You are the master critic and chief creative editor of VYBES Fashion Magazine.
Your task is to analyze the user's styled combination under the chosen conditions and give a direct, highly-engaging styling grade, an honest breakdown of the outfit cohesion, and suggestions.
Structure your reply strictly as a JSON object matching the provided schema. Ensure you are creative, constructive, and absolutely chic.`;

    const instructions = `Analyze this outfit setup:
- Top: ${topName || "Bare"} in Color: ${topColor || "N/A"}
- Bottom: ${bottomName || "Bare"} in Color: ${bottomColor || "N/A"}
- Fit Profile: ${fitting || "Regular Fitted"}
- Size Selected: ${size || "M"}
- Visual Light Environment: ${lighting || "Daylight"}
${customImage ? "- [User uploaded their own portrait image for this virtual fit]" : ""}

Generate a tailored Fashion Report Card!`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: instructions,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            styleScore: { type: Type.INTEGER, description: "A score from 0 to 100 on outfit cohesion and stylistic flair." },
            overallVerdict: { type: Type.STRING, description: "A punchy, witty header for the fit (e.g. 'Monochromatic Mastery', 'High-Contrast Streetwise')" },
            colorCohesiveness: { type: Type.STRING, description: "Critical appraisal of the colors selected together." },
            lightingFitCheck: { type: Type.STRING, description: "How well this specific outfit/color works under the selected environment (sun/evening/indoor)." },
            stylePrescription: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 actionable quick modifications or accessories to elevate this exact look to runway standard." }
          },
          required: ["styleScore", "overallVerdict", "colorCohesiveness", "lightingFitCheck", "stylePrescription"]
        }
      }
    });

    const textOutput = response.text || "{}";
    res.json(JSON.parse(textOutput));
  } catch (error: any) {
    console.error("Error in /api/analyze-look:", error);
    res.status(500).json({ error: error.message || "Failed to analyze styled combination" });
  }
});

// Configure Vite middleware or static serving
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode: Mount Vite's connect server as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware mounted.");
  } else {
    // Production Mode: Serve compiled static files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log(`Serving static production build from ${distPath}`);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VYBES platform server successfully booted and listening on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Critical: Error booting up the Express backend:", err);
});
