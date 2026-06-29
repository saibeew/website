require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testNewKey() {
    console.log("--- New Gemini Key Test ---");
    console.log("Key:", process.env.GEMINI_API_KEY ? "PROVIDED" : "MISSING");
    
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Test with gemini-flash-latest first as it's the current production model
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        console.log("Pinging gemini-flash-latest...");
        const res = await model.generateContent("ping");
        console.log("Response:", res.response.text());
        console.log("Status: SUCCESS");
    } catch (e) {
        console.error("Status: FAILED");
        console.error("Error:", e.message);
    }
}

testNewKey();
