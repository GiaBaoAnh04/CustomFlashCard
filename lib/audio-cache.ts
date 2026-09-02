// lib/audio-cache.ts
import crypto from "crypto";
import textToSpeech from "@google-cloud/text-to-speech";
import { put } from "@vercel/blob";
import AudioCache from "@/models/AudioCache";
import { connectDB } from "./mongodb";

const VOICE_MAP: Record<"en" | "ko", { languageCode: string; name: string }> = {
  en: { languageCode: "en-US", name: "en-US-Wavenet-D" },
  ko: { languageCode: "ko-KR", name: "ko-KR-Wavenet-A" },
};

function normalize(text: string) {
  return text.trim().toLowerCase();
}

function cacheKey(text: string, language: string) {
  return crypto
    .createHash("sha256")
    .update(`${language}:${normalize(text)}`)
    .digest("hex");
}

let ttsClient: InstanceType<typeof textToSpeech.TextToSpeechClient> | null =
  null;

function getTtsClient() {
  if (ttsClient) return ttsClient;

  const credentials = JSON.parse(process.env.GOOGLE_TTS_CREDENTIALS!);
  ttsClient = new textToSpeech.TextToSpeechClient({ credentials });
  return ttsClient;
}

export async function getOrCreateAudioUrl(
  text: string,
  language: "en" | "ko"
): Promise<string> {
  await connectDB();

  const key = cacheKey(text, language);

  const existing = await AudioCache.findOne({ key }).lean();
  if (existing) return existing.url;

  const voice = VOICE_MAP[language];
  const client = getTtsClient();

  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: { languageCode: voice.languageCode, name: voice.name },
    audioConfig: { audioEncoding: "MP3", speakingRate: 0.9 },
  });

  if (!response.audioContent) {
    throw new Error("Google TTS không trả về audio");
  }

  const blob = await put(`audio/${key}.mp3`, response.audioContent as Buffer, {
    access: "public",
    contentType: "audio/mpeg",
  });

  await AudioCache.create({ key, text, language, url: blob.url });

  return blob.url;
}
