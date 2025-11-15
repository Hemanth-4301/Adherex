import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';    
dotenv.config();

// Initialize Gemini AI with API key from environment
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Generate AI response
export const generateAIResponse = async (prompt) => {
  try {
    console.log('Generating AI response...');
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    console.log('AI response received successfully');
    return response.text;
  } catch (error) {
    console.error('Error generating AI response:', error);
    console.error('Error details:', error.message);
    throw new Error('Failed to generate AI response: ' + error.message);
  }
};

export default { generateAIResponse };
