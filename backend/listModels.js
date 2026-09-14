require("dotenv").config();

async function checkModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY missing in .env");
    return;
  }

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();

    if (data.error) {
      console.error("❌ API Error:", data.error.message);
      return;
    }

    console.log("✅ Models supporting generateContent on your key:");
    const supported = (data.models || [])
      .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m) => m.name.replace("models/", ""));
    
    console.log(supported);
  } catch (err) {
    console.error("❌ Failed to query models:", err.message);
  }
}

checkModels();