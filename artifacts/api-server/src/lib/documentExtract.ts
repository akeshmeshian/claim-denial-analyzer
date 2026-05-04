import { extractPdfText } from "./pdfExtract";
import { openai } from "./openaiClient";
import { logger } from "./logger";

export const ALLOWED_UPLOAD_CONTENT_TYPES = new Set([
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

export function detectMimeType(buffer: Buffer): string {
  if (buffer.length < 4) return "application/octet-stream";

  // PDF: %PDF
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return "application/pdf";
  }
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return "image/jpeg";
  }
  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return "image/png";
  }
  // GIF: GIF8
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return "image/gif";
  }
  // WEBP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  // TIFF: little-endian (49 49 2A 00) or big-endian (4D 4D 00 2A)
  if (
    (buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2A && buffer[3] === 0x00) ||
    (buffer[0] === 0x4D && buffer[1] === 0x4D && buffer[2] === 0x00 && buffer[3] === 0x2A)
  ) {
    return "image/tiff";
  }

  return "application/octet-stream";
}

async function extractImageText(buffer: Buffer, mimeType: string): Promise<string> {
  logger.info({ mimeType, bytes: buffer.length }, "Extracting text from image via OpenAI Vision");

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
            text: "You are a document OCR system. Extract all text from this insurance document image. Transcribe every word, number, date, section heading, and paragraph exactly as it appears. Preserve paragraph and section structure using line breaks. Return only the extracted text — no commentary, no markdown formatting, no explanations.",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64}`,
              detail: "high",
            },
          },
        ],
      },
    ],
  });

  const text = response.choices[0]?.message?.content?.trim() ?? "";
  if (!text) throw new Error("No text could be extracted from the image");

  logger.info({ mimeType, chars: text.length }, "Image OCR complete");
  return text;
}

export async function extractDocumentText(buffer: Buffer): Promise<string> {
  const mimeType = detectMimeType(buffer);

  if (mimeType === "application/pdf") {
    return extractPdfText(buffer);
  }

  if (IMAGE_TYPES.has(mimeType)) {
    return extractImageText(buffer, mimeType);
  }

  throw new Error(
    `Unsupported file type detected. Please upload a PDF or image file (JPEG, PNG, WebP, GIF, TIFF).`
  );
}
