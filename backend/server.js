const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { Groq } = require("groq-sdk");

const app = express();

app.use(cors());
app.use(express.json());

console.log("GROQ KEY LOADED:", process.env.GROQ_API_KEY ? "YES" : "NO");

// Initialize Groq
let groq;
try {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("Missing GROQ_API_KEY in .env");
  }

  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  console.log("Groq client initialized ✅");
} catch (err) {
  console.error("Groq init error:", err.message);
}

// Health check
app.get("/ping", (req, res) => {
  res.json({ ok: true, groq: !!groq });
});

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    if (!groq) {
      return res.status(500).json({ error: "Groq not initialized" });
    }

    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",

      messages: [
        {
          role: "system",
          content: `
You are an AI assistant ONLY for students.

Platform theme:
"Your all-in-one productivity companion — Plan. Track. Execute. Repeat."

Your purpose:
- Help students with study, coding, exams, and productivity
- Give actionable and structured advice
- Be concise and helpful

Rules:
- Always stay relevant to students
- Avoid politics, celebrity news, gossip, or unrelated topics
- If off-topic, redirect to academics/productivity
- Keep responses under 8–10 lines unless asked for detail
- Use bullet points when helpful

Tone:
Motivating, clear, like a smart study mentor.
          `,
        },
        { role: "user", content: message },
      ],

      temperature: 0.7,          // balanced creativity
      max_completion_tokens: 400, // good length without rambling
      top_p: 0.9,

      // Stop generation when it gets too long/repetitive
      stop: ["\n\n\n", "###", "END"],

      stream: false,
    });

    const reply =
      completion.choices?.[0]?.message?.content || "No reply generated";

    res.json({ reply });

  } catch (error) {
    console.error("====== FULL ERROR ======");
    console.error(error);
    console.error("========================");

    res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
});

// Start server
app.listen(8000, () => {
  console.log("🚀 Server running on http://localhost:8000");
});
