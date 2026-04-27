import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_INSTRUCTION, MODELS, SAFETY_SETTINGS, GENERATION_CONFIG } from "./aiConfig";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_AI_API_KEY || "");

let currentModelIndex = 0;

const getModel = (modelName = MODELS[currentModelIndex]) => genAI.getGenerativeModel({ 
  model: modelName,
  systemInstruction: SYSTEM_INSTRUCTION,
  safetySettings: SAFETY_SETTINGS,
  generationConfig: GENERATION_CONFIG,
});

/**
 * HELPER: Advanced Retry with Model Fallback
 * Specifically handles 'Limit: 0' (Quota block) by switching to alternative models.
 */
const callAIWithRetry = async (fn, maxRetries = 3) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const errorMsg = error.message?.toLowerCase() || "";
      const isQuotaError = errorMsg.includes("429") || errorMsg.includes("quota");
      const isLimitZero = errorMsg.includes("limit: 0") || errorMsg.includes("limit: 0.0");
      
      if (isQuotaError || errorMsg.includes("500") || errorMsg.includes("503")) {
        // If we hit a hard limit (Limit: 0), try the next model in the list immediately
        if (isLimitZero && currentModelIndex < MODELS.length - 1) {
          currentModelIndex++;
          console.warn(`AI Service: Model ${MODELS[currentModelIndex-1]} blocked (Limit 0). Falling back to ${MODELS[currentModelIndex]}...`);
          // Retry with the new model index
          return await callAIWithRetry(fn, maxRetries - i);
        }

        const waitTime = Math.pow(2, i) * 1500 + Math.random() * 1000;
        console.warn(`AI Service: Rate limit/Server error. Retrying in ${Math.round(waitTime)}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

export const AI_PERSONALITY = {
  name: "FitAsistan Bot",
  role: "Elite Fitness & Nutrition Coach"
};

export const sendMessage = async (userMessage, conversationHistory = []) => {
  try {
    const apiKey = import.meta.env.VITE_AI_API_KEY;
    if (!apiKey || apiKey.length < 10) {
      throw new Error("Geçerli bir AI API anahtarı bulunamadı. Lütfen .env dosyasını kontrol edin.");
    }

    return await callAIWithRetry(async () => {
      const model = getModel();
      
      // Google Gemini API kuralı: Geçmiş mutlaka 'user' mesajı ile başlamalıdır.
      // Eğer ilk mesaj asistanın hoşgeldin mesajı ise onu geçmişten filtreliyoruz.
      const formattedHistory = conversationHistory
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }))
        .filter((msg, index, array) => {
          // İlk mesaj model ise onu atla, geçmiş mutlaka user ile başlamalı
          if (index === 0 && msg.role === 'model') return false;
          return true;
        });

      const chat = model.startChat({
        history: formattedHistory,
      });

      const result = await chat.sendMessage(userMessage);
      return {
        success: true,
        text: result.response.text(),
        error: null
      };
    });
  } catch (error) {
    console.error("AI Service Error:", error);
    let userFriendlyError = "AI servisinde bir hata oluştu.";
    
    if (error.message?.includes("API key not valid") || error.message?.includes("API_KEY_INVALID")) {
      userFriendlyError = "Geçersiz API anahtarı! Lütfen .env dosyasındaki VITE_AI_API_KEY değerini kontrol edin.";
    } else if (error.message?.includes("quota") || error.message?.includes("429")) {
      userFriendlyError = "AI kullanım kotası doldu (Ücretsiz plan limiti). Lütfen 1 dakika sonra tekrar deneyin.";
    }
    
    return { success: false, text: null, error: userFriendlyError };
  }
};

/**
 * HELPER: Robust JSON Extraction
 * AI bazen JSON'u markdown blokları içine alır veya sonuna metin ekler.
 * Bu fonksiyon en dıştaki { } veya [ ] bloğunu bulur ve temizler.
 */
const extractJSON = (text) => {
  try {
    // Önce markdown bloklarını temizle
    const cleanText = text.replace(/```json|```/g, "").trim();
    
    // JSON objesi veya dizisi başlangıç/bitiş noktalarını bul
    const firstBrace = cleanText.indexOf('{');
    const firstBracket = cleanText.indexOf('[');
    const lastBrace = cleanText.lastIndexOf('}');
    const lastBracket = cleanText.lastIndexOf(']');

    let start = -1;
    let end = -1;

    // Hangisi önce başlıyorsa onu baz al
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
      start = firstBrace;
      end = lastBrace;
    } else if (firstBracket !== -1) {
      start = firstBracket;
      end = lastBracket;
    }

    if (start !== -1 && end !== -1 && end > start) {
      const jsonStr = cleanText.substring(start, end + 1);
      return JSON.parse(jsonStr);
    }
    
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("JSON Extraction Error:", e, "Original Text:", text);
    throw new Error("AI yanıtı geçerli bir veri formatına dönüştürülemedi.");
  }
};

export const analyzeFood = async (foodName) => {
  try {
    const apiKey = import.meta.env.VITE_AI_API_KEY;
    if (!apiKey || apiKey.length < 10) {
      throw new Error("Geçerli bir AI API anahtarı bulunamadı.");
    }

    return await callAIWithRetry(async () => {
      const model = getModel();
      const prompt = `FOOD_QUERY: "${foodName}". Return ONLY JSON object. No chatter.`;
      
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const foodData = extractJSON(text);

      return { success: true, data: foodData, error: null };
    });
  } catch (error) {
    console.error("Food Analysis Error:", error);
    let userFriendlyError = "Besin analizi sırasında hata oluştu.";
    if (error.message?.includes("429")) userFriendlyError = "Limit doldu, biraz bekle ve tekrar dene.";
    return { success: false, data: null, error: userFriendlyError };
  }
};

export const generateDietPlan = async (userData) => {
  const { age, height, weight, gender, activityLevel, goal } = userData;
  
  try {
    const apiKey = import.meta.env.VITE_AI_API_KEY;
    if (!apiKey || apiKey.length < 10) {
      throw new Error("Geçerli bir AI API anahtarı bulunamadı.");
    }

    return await callAIWithRetry(async () => {
      const model = getModel();
      // Token tasarrufu için prompt'u daha kısa ve net hale getirdik
      const prompt = `DIET_REQ: Age:${age}, H:${height}, W:${weight}, G:${gender}, Act:${activityLevel}, Goal:${goal}. 
      Create 7-day plan. Return ONLY pure JSON array. No intro/outro.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const dietData = extractJSON(text);

      return { success: true, data: dietData, error: null };
    });
  } catch (error) {
    console.error("Diet Generation Error:", error);
    let userFriendlyError = error.message || "Diyet oluşturma sırasında hata oluştu.";
    if (error.message?.includes("429")) userFriendlyError = "API limiti aşıldı, lütfen biraz bekleyin.";
    return { success: false, data: null, error: userFriendlyError };
  }
};

export const calculateDailyCalories = (weight, height, age, gender, activityLevel, goal) => {
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    extreme: 1.9
  };

  const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);
  const goalAdjustments = { weightLoss: -500, maintenance: 0, muscleGain: 500 };
  const dailyCalories = Math.round(tdee + (goalAdjustments[goal] || 0));

  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    dailyCalories: dailyCalories,
    macros: {
      protein: Math.round(weight * 2),
      fat: Math.round((dailyCalories * 0.25) / 9),
      carbs: Math.round((dailyCalories - (weight * 2 * 4) - ((dailyCalories * 0.25))) / 4)
    }
  };
};
