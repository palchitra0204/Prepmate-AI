const fs = require("fs");
const mammoth = require("mammoth");
const officeparser = require("officeparser");
const pdfParseModule = require("pdf-parse");

/**
 * Extract text from PDF file.
 * Handles both newer pdf-parse (v2+ PDFParse class) and legacy function style,
 * with officeparser fallback.
 */
const extractPdfText = async (filePath) => {
    const fileBuffer = await fs.promises.readFile(filePath);

    // pdf-parse v2+ (class-based)
    if (pdfParseModule && pdfParseModule.PDFParse) {
        const parser = new pdfParseModule.PDFParse({
            data: fileBuffer,
        });

        try {
            const result = await parser.getText();
            if (result && typeof result.text === "string" && result.text.trim()) {
                return result.text;
            }
        } finally {
            await parser.destroy().catch(() => {});
        }
    }

    // pdf-parse v1 (function-based)
    if (typeof pdfParseModule === "function") {
        const result = await pdfParseModule(fileBuffer);
        if (result && typeof result.text === "string" && result.text.trim()) {
            return result.text;
        }
    }

    // officeparser fallback
    try {
        const officeResult = await officeparser.parseOffice(filePath);
        if (officeResult && officeResult.trim()) {
            return officeResult;
        }
    } catch {
        // Fallback failed
    }

    throw new Error("Could not extract readable text from PDF file");
};

/**
 * Extract text from DOC and DOCX files using mammoth with officeparser fallback.
 */
const extractDocxText = async (filePath) => {
    try {
        const result = await mammoth.extractRawText({
            path: filePath,
        });

        if (result && result.value && result.value.trim()) {
            return result.value;
        }
    } catch {
        // mammoth failed, try officeparser
    }

    try {
        const officeResult = await officeparser.parseOffice(filePath);
        if (officeResult && officeResult.trim()) {
            return officeResult;
        }
    } catch {
        // Fallback failed
    }

    throw new Error("Could not extract readable text from DOC/DOCX file");
};

/**
 * Extract text from PPTX files using officeparser.
 */
const extractPptxText = async (filePath) => {
    try {
        const officeResult = await officeparser.parseOffice(filePath);
        if (officeResult && officeResult.trim()) {
            return officeResult;
        }
    } catch (err) {
        throw new Error(`Could not extract text from presentation: ${err.message}`);
    }

    throw new Error("No readable text found in presentation file");
};

/**
 * Read text from plain TXT file.
 */
const extractTxtText = async (filePath) => {
    return fs.promises.readFile(filePath, "utf8");
};

/**
 * Main dispatcher to extract cleaned text based on file type.
 */
const extractTextFromFile = async (filePath, fileType) => {
    const normalizedType = String(fileType || "").toUpperCase();
    let extractedText = "";

    if (normalizedType === "PDF") {
        extractedText = await extractPdfText(filePath);
    } else if (normalizedType === "DOCX" || normalizedType === "DOC") {
        extractedText = await extractDocxText(filePath);
    } else if (normalizedType === "PPTX" || normalizedType === "PPT") {
        extractedText = await extractPptxText(filePath);
    } else if (normalizedType === "TXT") {
        extractedText = await extractTxtText(filePath);
    } else {
        throw new Error(`Unsupported file type: ${fileType}`);
    }

    const cleanedText = (extractedText || "")
        .replace(/\u0000/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    if (!cleanedText) {
        throw new Error("No readable text was found in the uploaded file");
    }

    return cleanedText;
};

module.exports = {
    extractTextFromFile,
};