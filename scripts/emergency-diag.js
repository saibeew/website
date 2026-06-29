require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");

async function diagnose() {
    console.log("--- AI DIAGNOSTIC SWEEP ---");
    
    // 1. Test Gemini
    console.log("\n[1] Testing Gemini (gemini-1.5-flash)...");
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const res = await model.generateContent("ping");
        console.log("Gemini Status: ONLINE");
    } catch (e) {
        console.error("Gemini Status: OFFLINE");
        console.error("Error:", e.message);
    }

    // 2. Test OpenAI
    console.log("\n[2] Testing OpenAI (gpt-4o-mini)...");
    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const res = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: "ping" }]
        });
        console.log("OpenAI Status: ONLINE");
    } catch (e) {
        console.error("OpenAI Status: OFFLINE");
        console.error("Error:", e.message);
    }
}

diagnose();
