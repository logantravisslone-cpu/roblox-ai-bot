const express = require("express");
const { OpenAI } = require("openai");

const app = express();
app.use(express.json());

const HF_TOKEN = process.env.HF_TOKEN;

console.log("HF_TOKEN exists:", !!HF_TOKEN);

const ai = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: HF_TOKEN
});

app.get("/", (req, res) => {
    res.send("Roblox AI is online!");
});

app.get("/health", (req, res) => {
    res.json({
        server: "online",
        hf_token: !!HF_TOKEN
    });
});

app.post("/think", async (req, res) => {

    console.log("Received /think request");
    console.log("Request:", req.body);

    try {

        if (!HF_TOKEN) {
            throw new Error("HF_TOKEN is missing from Render environment variables.");
        }

        const situation =
            req.body.situation ||
            "You are standing in a Roblox world. Decide what you want to do.";

        console.log("Asking AI...");

        const response = await ai.chat.completions.create({

            model: "openai/gpt-oss-120b:fastest",

            messages: [
                {
                    role: "system",
                    content: `
You are an autonomous AI character inside Roblox.

You can:
- walk
- jump
- talk
- create a block
- wait

Choose ONE action.

Return ONLY JSON.

Example:
{"action":"jump"}

Example:
{"action":"say","message":"hello"}

Example:
{"action":"walk","x":20,"y":5,"z":10}

Example:
{"action":"create_block"}
`
                },

                {
                    role: "user",
                    content: situation
                }
            ],

            max_tokens: 100
        });

        console.log("AI response received.");

        const text =
            response.choices[0].message.content
                .replace(/```json/gi, "")
                .replace(/```/g, "")
                .trim();

        console.log("AI said:", text);

        const action = JSON.parse(text);

        res.json(action);

    } catch (error) {

        console.error("========== AI ERROR ==========");
        console.error(error);
        console.error("================================");

        res.status(500).json({
            error: "AI request failed",
            message: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI server running on port ${PORT}`);
});
