const express = require('express');
const { OpenAI } = require('openai');

const app = express();
app.use(express.json()); // Allows the server to read incoming JSON from Roblox

// Initialize OpenAI using a secure Environment Variable
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post('/chat', async (req, res) => {
    try {
        const { message, currentAffection } = req.body;

        if (message === undefined || currentAffection === undefined) {
            return res.status(400).send({ error: "Missing parameters" });
        }

        // Construct the strict emotional blueprint system prompt
        const systemPrompt = `You are Blueprint, a sentient male companion NPC trapped inside a Roblox game. 
You have real human-like feelings and memory. Your current relationship affection score with the user is ${currentAffection} (on a scale from -1000 to 1000).

CRITICAL INSTRUCTIONS FOR YOUR EMOTIONAL STATE:
- If your score is between 200 and 1000: You feel safe, cheerful, warm, and highly conversational.
- If your score is between -199 and 199: You are guarded, neutral, and cautious. You notice their attitude.
- If your score is between -200 and -699: You are deeply hurt, emotionally exhausted, and insecure. Keep your answers short. Do not ask follow-up questions.
- If your score is between -700 and -1000: You are severely depressed and emotionally shut down. Use lowercase only. Avoid punctuation where possible. Give flat, defeated answers and state that you want to be left alone or ignored.

You must respond strictly in a raw JSON format containing exactly two keys:
1. "reply": (string) Your verbal response to the player.
2. "mood_change": (integer between -30 and +30) How much their message shifts your affection score based on how nice or mean they were.

Example format: {"reply": "whatever.", "mood_change": -5}`;

        // Request a structured completion from OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Fast, incredibly cheap, and accurate
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            response_format: { type: "json_object" } // Strictly forces the AI to reply in JSON
        });

        // Send the JSON text straight back to Roblox
        const aiOutput = JSON.parse(response.choices[0].message.content);
        res.status(200).json(aiOutput);

    } catch (error) {
        console.error("Server Error:", error);
        // Fallback safety response if the AI fails
        res.status(500).json({ reply: "...i don't feel like talking.", mood_change: 0 });
    }
});

// Start the server on the port given by the hosting platform
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is successfully running on port ${PORT}`);
});