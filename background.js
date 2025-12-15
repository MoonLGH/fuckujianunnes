// background.js

const GEMINI_API_KEYS = [];
//useurown

const MODEL_NAME = "gemini-2.5-flash-lite";
const REQUEST_DELAY_MS = 800;

// Listener pesan dari content.js
chrome.runtime.onMessage.addListener((request, sender) => {
    if (request.action === "askGemini") {
        getAnswerFromGemini(request.pageContent, sender.tab.id);
    }
    return true;
});

// Helper delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Ambil API key random
function getRandomApiKey() {
    return GEMINI_API_KEYS[Math.floor(Math.random() * GEMINI_API_KEYS.length)];
}

async function getAnswerFromGemini(pageContent, tabId) {
    const apiKey = getRandomApiKey();

    if (!apiKey) {
        sendResponseToTab(tabId, "Error: Tidak ada API Key tersedia", true);
        return;
    }

    // Delay biar gak keliatan rakus
    await sleep(REQUEST_DELAY_MS);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`;

    const fullPrompt = `
Jawab pertanyaan berikut secara langsung, singkat, dan akurat lalu sertakan isinya, seperti A.CONTOH TEKS 1.
Konteks:
${pageContent.substring(0, 3000)}
`.trim();

    const payload = {
        contents: [{ parts: [{ text: fullPrompt }] }]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || "API Error");
        }

        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!answer) {
            throw new Error("Tidak ada jawaban dari AI.");
        }

        sendResponseToTab(tabId, answer, false);

    } catch (error) {
        console.error("Gemini Error:", error.message);
        sendResponseToTab(tabId, `Gagal: ${error.message}`, true);
    }
}

// Kirim balik ke content script
function sendResponseToTab(tabId, answer, isError) {
    chrome.tabs.sendMessage(tabId, {
        action: "displayAnswer",
        answer,
        isError
    }).catch(() => console.log("Tab mungkin sudah ditutup."));
}
