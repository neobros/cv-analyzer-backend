const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

async function extractCvText(file) {
  if (!file || !file.buffer) {
    return "";
  }

  const fileName = (file.originalname || "").toLowerCase();
  const mimeType = file.mimetype || "";

  if (mimeType.includes("pdf") || fileName.endsWith(".pdf")) {
    const result = await pdfParse(file.buffer);
    return normalizeText(result.text);
  }

  if (
    mimeType.includes("word") ||
    mimeType.includes("officedocument") ||
    fileName.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return normalizeText(result.value);
  }

  if (mimeType.startsWith("text/") || fileName.endsWith(".txt")) {
    return normalizeText(file.buffer.toString("utf8"));
  }

  return "";
}

module.exports = {
  extractCvText
};
