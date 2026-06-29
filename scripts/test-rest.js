require('dotenv').config({ path: '.env.local' });
// fetch is global in Node 18+

async function testRest() {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${key}`;
    
    console.log("Testing REST API for Gemini 1.5-flash...");
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "hi" }] }]
            })
        });
        
        const data = await response.json();
        console.log("REST Response Status:", response.status);
        if (response.status !== 200) {
            console.log("REST Error:", JSON.stringify(data, null, 2));
        } else {
            console.log("REST Success:", data.candidates[0].content.parts[0].text);
        }
    } catch (e) {
        console.log("REST Fetch Failed:", e.message);
    }
}

testRest();
