import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";

// Load .env.local manually
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const models = [
  "gemini-1.5-flash",
  "gemini-1.5-pro", 
  "gemini-1.0-pro", 
  "gemini-pro",
  "gemini-1.5-flash-latest"
];

async function check() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ No API Key found in .env.local");
    return;
  }
  
  console.log(`Checking key: ${apiKey.substring(0, 10)}...`);
  const genAI = new GoogleGenerativeAI(apiKey);

  for (const m of models) {
    try {
      console.log(`Testing model: ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      // Minimal generation
      const result = await model.generateContent("Hi");
      const response = await result.response;
      console.log(`✅ SUCCESS: ${m} responded: "${response.text().substring(0, 10)}..."`);
      return; // Stop on first success
    } catch (e: any) {
      console.log(`❌ FAILED: ${m}`);
      // console.log(e.message); // Uncomment for full error
    }
  }
  console.log("All models failed.");
}

check();
