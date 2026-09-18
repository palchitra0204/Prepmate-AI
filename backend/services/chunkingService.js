/*
 * Extracted material text ko clean karta hai.
 */
const normalizeText = (text = "") => {
    return String(text)
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
};

/*
 * Text ko overlapping chunks mein divide karta hai.
 *
 * Example:
 * Chunk 1: words 0–319
 * Chunk 2: words 260–579
 *
 * Dono chunks ke beech 60 words overlap honge.
 */
const createTextChunks = (
    text,
    options = {}
) => {
    const chunkSize = Number(
        options.chunkSize || 320
    );

    const chunkOverlap = Number(
        options.chunkOverlap || 60
    );

    if (
        !Number.isInteger(chunkSize) ||
        chunkSize < 50
    ) {
        throw new Error(
            "Chunk size must be an integer greater than or equal to 50"
        );
    }

    if (
        !Number.isInteger(chunkOverlap) ||
        chunkOverlap < 0 ||
        chunkOverlap >= chunkSize
    ) {
        throw new Error(
            "Chunk overlap must be smaller than chunk size"
        );
    }

    const normalizedText =
        normalizeText(text);

    if (!normalizedText) {
        return [];
    }

    const words =
        normalizedText.split(/\s+/);

    const chunks = [];

    let startWord = 0;
    let chunkIndex = 0;

    while (startWord < words.length) {
        const endWord = Math.min(
            startWord + chunkSize,
            words.length
        );

        const content = words
            .slice(startWord, endWord)
            .join(" ")
            .trim();

        if (content) {
            chunks.push({
                chunkIndex,
                content,
                wordCount:
                    endWord - startWord,
                startWord,
                endWord:
                    Math.max(startWord, endWord - 1),
            });

            chunkIndex += 1;
        }

        if (endWord >= words.length) {
            break;
        }

        startWord =
            endWord - chunkOverlap;
    }

    return chunks;
};

module.exports = {
    normalizeText,
    createTextChunks,
};