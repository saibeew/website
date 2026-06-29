require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require('openai');

async function testAI() {
    console.log("Checking GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "EXISTS" : "MISSING");
    console.log("Checking OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "EXISTS" : "MISSING");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    console.log("\n--- Testing Gemini ---");
    try {
        const result = await model.generateContent("hello");
        const response = await result.response;
        console.log("Gemini Success:", response.text());
    } catch (e) {
        console.log("Gemini Failed:", e.message);
        if (e.response) console.log("Gemini Code:", e.response.status);
    }

    console.log("\n--- Testing OpenAI ---");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: "hello" }],
        });
        console.log("OpenAI Success:", response.choices[0].message.content);
    } catch (e) {
        console.log("OpenAI Failed:", e.message);
    }
}

testAI();
