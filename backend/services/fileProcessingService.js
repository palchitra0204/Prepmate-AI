const fs = require("fs");
const mammoth = require("mammoth");
const pdfParseModule = require("pdf-parse");

// PDF file se text extract karega
const extractPdfText = async (filePath) => {
    const fileBuffer = await fs.promises.readFile(filePath);

    // pdf-parse ke older version ke liye
    if (typeof pdfParseModule === "function") {
        const result = await pdfParseModule(fileBuffer);

        return result.text;
    }

    // pdf-parse ke newer version ke liye
    if (pdfParseModule.PDFParse) {
        const parser = new pdfParseModule.PDFParse({
            data: fileBuffer,
        });

        try {
            const result = await parser.getText();

            return result.text;
        } finally {
            await parser.destroy();
        }
    }

    throw new Error(
        "Installed pdf-parse version is not supported"
    );
};

// DOC aur DOCX file se text extract karega
const extractDocxText = async (filePath) => {
    const result = await mammoth.extractRawText({
        path: filePath,
    });

    return result.value;
};

// TXT file se text read karega
const extractTxtText = async (filePath) => {
    return fs.promises.readFile(filePath, "utf8");
};

// File type ke according proper function call karega
const extractTextFromFile = async (
    filePath,
    fileType
) => {
    let extractedText = "";

    if (fileType === "PDF") {
        extractedText = await extractPdfText(filePath);
    } else if (fileType === "DOCX") {
        extractedText = await extractDocxText(filePath);
    } else if (fileType === "TXT") {
        extractedText = await extractTxtText(filePath);
    } else {
        throw new Error("Unsupported file type");
    }

    const cleanedText = extractedText
        .replace(/\u0000/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    if (!cleanedText) {
        throw new Error(
            "No readable text was found in the uploaded file"
        );
    }

    return cleanedText;
};

module.exports = {
    extractTextFromFile,
};