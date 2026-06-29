require('dotenv').config({ path: '.env.local' });
// fetch is global in Node 18+

async function listAllModels() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    
    console.log("Listing all available models via REST API...");
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        console.log("Response Status:", response.status);
        if (response.status !== 200) {
            console.log("Error:", JSON.stringify(data, null, 2));
        } else {
            console.log("Available Models:");
            data.models.forEach(m => {
                console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
            });
        }
    } catch (e) {
        console.log("Fetch Failed:", e.message);
    }
}

listAllModels();
