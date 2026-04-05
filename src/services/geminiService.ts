import { GoogleGenAI, Modality, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

let audioContext: AudioContext | null = null;

export async function speakText(text: string, languageName: string = 'English') {
  try {
    if (!audioContext) {
      audioContext = new AudioContext({ sampleRate: 24000 });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say cheerfully in ${languageName}: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const arrayBuffer = base64ToArrayBuffer(base64Audio);
      const int16Array = new Int16Array(arrayBuffer);
      const float32Array = new Float32Array(int16Array.length);
      
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768;
      }

      const audioBuffer = audioContext.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    }
  } catch (error) {
    console.error("TTS Error:", error);
  }
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  if (targetLanguage === 'English') return text;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following text to ${targetLanguage}. Return ONLY the translated text: "${text}"`,
    });
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Translation Error:", error);
    return text;
  }
}

export async function translateObject<T extends object>(obj: T, targetLanguage: string): Promise<T> {
  if (targetLanguage === 'English') return obj;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the values of this JSON object to ${targetLanguage}. Keep the keys exactly the same. Return ONLY the translated JSON object: ${JSON.stringify(obj)}`,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const translated = JSON.parse(response.text || '{}');
    return { ...obj, ...translated };
  } catch (error) {
    console.error("Object Translation Error:", error);
    return obj;
  }
}

function base64ToArrayBuffer(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function generateLetterImage(prompt: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Image Gen Error:", error);
  }
  return null;
}
