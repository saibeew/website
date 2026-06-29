import { getAiResponse } from '../src/lib/ai';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function runTest() {
    const prompt = `
        Analyze my performance for EURUSD.
        winRate: 35
        profitFactor: 0.9
        maxDD: 18
        avgWin: 120
        avgLoss: 200
    `;

    console.log("Querying Anti-Gravity AI...");
    const response = await getAiResponse(prompt);
    
    console.log("\n--- BRAIN RESPONSE ---");
    console.log(response);
    console.log("----------------------\n");
}

runTest().catch(console.error);
