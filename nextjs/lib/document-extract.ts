import { openai } from "./openai";

const MAX_CHARS = 80000;

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/tiff",
]);

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/tiff",
]);

export { ALLOWED_TYPES as ALLOWED_UPLOAD_CONTENT_TYPES };

export function detectMimeType(buffer: Buffer): string {
  if (buffer.length < 4) return "application/octet-stream";
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) return "application/pdf";
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "image/png";
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return "image/gif";
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if ((buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2a && buffer[3] === 0x00) || (buffer[0] === 0x4d && buffer[1] === 0x4d && buffer[2] === 0x00 && buffer[3] === 0x2a)) return "image/tiff";
  return "application/octet-stream";
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  const text = result.text.trim();
  return text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text;
}

async function extractImageText(buffer: Buffer, mimeType: string): Promise<string> {
  const base64 = buffer.toString("base64");
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "You are a document OCR system. Extract all text from this insurance document image. Transcribe every word, number, date, section heading, and paragraph exactly as it appears. Return only the extracted text — no commentary, no markdown, no explanations.",
          },
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${base64}`, detail: "high" },
          },
        ],
      },
    ],
  });
  const text = response.choices[0]?.message?.content?.trim() ?? "";
  if (!text) throw new Error("No text could be extracted from the image");
  return text;
}

export async function extractDocumentText(buffer: Buffer): Promise<string> {
  const mimeType = detectMimeType(buffer);
  if (mimeType === "application/pdf") return extractPdfText(buffer);
  if (IMAGE_TYPES.has(mimeType)) return extractImageText(buffer, mimeType);
  throw new Error("Unsupported file type. Please upload a PDF or image (JPEG, PNG, WebP, GIF, TIFF).");
}

export function isAllowedType(mimeType: string): boolean {
  return ALLOWED_TYPES.has(mimeType);
}
