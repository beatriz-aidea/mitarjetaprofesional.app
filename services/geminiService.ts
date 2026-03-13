
import { GoogleGenAI } from "@google/genai";
import { VCardData } from "../types";

export const generateProfessionalBio = async (data: VCardData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Basándote en estos datos de contacto, genera una biografía profesional corta y atractiva (máximo 150 caracteres) 
    para incluir en una tarjeta de visita digital (campo NOTE de vCard).
    
    Nombre: ${data.firstName} ${data.lastName}
    Puesto: ${data.title}
    Empresa: ${data.organization}
    
    El tono debe ser profesional pero moderno. Solo devuelve el texto de la biografía, nada más.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || '';
  } catch (error) {
    console.error("Error generating bio:", error);
    return "Profesional apasionado por la excelencia y la innovación.";
  }
};
