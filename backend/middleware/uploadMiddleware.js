const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDirectory = path.join(
    __dirname,
    "../uploads"
);

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true,
    });
}

const storage = multer.diskStorage({
    destination: (
        request,
        file,
        callback
    ) => {
        callback(
            null,
            uploadDirectory
        );
    },

    filename: (
        request,
        file,
        callback
    ) => {
        const extension = path
            .extname(file.originalname)
            .toLowerCase();

        const nameWithoutExtension =
            path.basename(
                file.originalname,
                extension
            );

        const safeFileName =
            nameWithoutExtension
                .replace(
                    /[^a-zA-Z0-9-_]/g,
                    "-"
                )
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, "")
                .toLowerCase();

        const uniqueFileName =
            `${Date.now()}-${Math.round(
                Math.random() * 1000000
            )}-${safeFileName}${extension}`;

        callback(
            null,
            uniqueFileName
        );
    },
});

const allowedMimeTypes = [
    "application/pdf",

    "application/msword",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    "text/plain",

    "application/vnd.ms-powerpoint",

    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const allowedExtensions = [
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".ppt",
    ".pptx",
];

const fileFilter = (
    request,
    file,
    callback
) => {
    const extension = path
        .extname(file.originalname)
        .toLowerCase();

    const validMimeType =
        allowedMimeTypes.includes(
            file.mimetype
        );

    const validExtension =
        allowedExtensions.includes(
            extension
        );

    if (
        validMimeType &&
        validExtension
    ) {
        callback(null, true);
        return;
    }

    callback(
        new Error(
            "Only PDF, DOC, DOCX, TXT, PPT and PPTX files are allowed"
        ),
        false
    );
};

const uploadMaterial = multer({
    storage,
    fileFilter,

    limits: {
        fileSize:
            10 * 1024 * 1024,
    },
});

module.exports = uploadMaterial;