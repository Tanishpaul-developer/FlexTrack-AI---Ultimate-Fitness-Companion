
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

async function retry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) return retry(fn, retries - 1);
    throw error;
  }
}

export async function generateWorkoutRoutine(goal: string, experience: string, equipment: string, profile?: UserProfile) {
  return retry(async () => {
    const ai = getAI();
    const profileContext = profile ? `User: ${profile.name}, Age ${profile.age}, Weight ${profile.weight}kg, Body Fat ${profile.bodyFatPercentage}%, Level: ${profile.activityLevel}.` : '';
    
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Complex task uses Pro
      contents: `${profileContext} Create a 7-day scientific workout routine. Goal: "${goal}", Level: "${experience}", Tools: "${equipment}". 
      Respond in strict JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            routineName: { type: Type.STRING },
            weeklySchedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        sets: { type: Type.NUMBER },
                        reps: { type: Type.STRING },
                        tips: { type: Type.STRING }
                      }
                    }
                  }
                }
              }
            }
          },
          required: ["routineName", "weeklySchedule"]
        }
      }
    });

    return JSON.parse(response.text);
  });
}

export async function getExerciseTips(exerciseName: string) {
  return retry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide 3 form corrections and 2 variations for: ${exerciseName}. Focus on safety.`,
    });
    return response.text;
  });
}

export async function getMotivationalQuote(streak: number) {
  return retry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Short, high-intensity quote for a ${streak}-day gym streak. Max 10 words.`,
    });
    return response.text;
  });
}

export async function getNutritionTips(profile: UserProfile) {
  return retry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Nutrition tips for: Age ${profile.age}, ${profile.weight}kg, ${profile.activityLevel} activity. Max 3 bullet points.`,
    });
    return response.text;
  });
}

export async function generateAvatar(profile: UserProfile) {
  try {
    const ai = getAI();
    const prompt = `A professional 3D fitness avatar of a ${profile.gender} athlete, clean background, high quality.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "1:1" } },
    });
    const part = response.candidates[0].content.parts.find(p => p.inlineData);
    return part ? `data:image/png;base64,${part.inlineData.data}` : null;
  } catch (error) {
    console.error("Avatar failed", error);
    return null;
  }
}
