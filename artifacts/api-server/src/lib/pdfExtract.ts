import { logger } from "./logger";

const MAX_CHARS = 80000;

export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    const text = result.text.trim();
    if (text.length > MAX_CHARS) {
      logger.warn({ chars: text.length }, "PDF text truncated to fit context limit");
      return text.slice(0, MAX_CHARS);
    }
    return text;
  } catch (err) {
    logger.error({ err }, "Failed to extract PDF text");
    throw new Error("Failed to extract text from PDF");
  }
}
