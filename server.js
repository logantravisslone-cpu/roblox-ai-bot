const express = require("express");
const { OpenAI } = require("openai");

const app = express();

app.use(express.json());

const ai = new OpenAI({
    baseURL: "https://router.huggingface.co/v1",
    apiKey: process.env.HF_TOKEN
});

app.post("/think", async (req, res) => {
    try {

        const situation = req.body.situation;

        const response = await ai.chat.completions.create({
            model: "openai/gpt-oss-120b:fastest",

            messages: [
                {
                    role: "system",
                    content: `
You are an AI character inside Roblox.

You have a body and can decide what to do.

You can:
- walk
- jump
- talk
- create a block
- wait

Choose ONE action.

Reply with ONLY JSON.

Example:

{
  "action": "jump"
}

Or:

{
  "action": "say",
  "message": "hello"
}

Or:

{
  "action": "walk",
  "x": 20,
  "y": 5,
  "z": 10
}

Or:

{
  "action": "create_block"
}
`
                },

                {
                    role: "user",
                    content: situation
                }
            ],

            max_tokens: 100
        });

        const text =
            response.choices[0].message.content
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

        const action = JSON.parse(text);

        res.json(action);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "AI failed"
        });
    }
});

app.get("/", (req, res) => {
    res.send("Roblox AI is online!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI server running on port ${PORT}`);
});
