require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    console.log("Fetching models...");
    try {
        // There isn't a direct listModels on the main class in some versions
        // but we can try to find how to do it in this SDK version.
        // Usually it's via a different manager or just guessing.
        
        // Let's try some common IDs
        const models = [
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-1.0-pro",
            "gemini-pro",
            "gemini-1.5-flash-latest"
        ];
        
        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent("hi");
                console.log(`Model ${m}: SUCCESS`);
                return; // Stop if we find one
            } catch (e) {
                console.log(`Model ${m}: FAILED - ${e.message}`);
            }
        }
    } catch (e) {
        console.log("List failed:", e.message);
    }
}

listModels();
