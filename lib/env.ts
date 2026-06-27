// lib/env.ts
export const env = {
  googleMapsApiKey: process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  mongoUri: process.env.MONGODB_URI || "",
};
