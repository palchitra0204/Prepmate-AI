const multer = require("multer");
const path = require("path");
const fs = require("fs");


const uploadDirectory =
    path.join(
        __dirname,
        "../uploads"
    );


if (
    !fs.existsSync(
        uploadDirectory
    )
) {
    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true,
        }
    );
}


const storage =
    multer.diskStorage({
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
            const extension =
                path
                    .extname(
                        file.originalname
                    )
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
                    .replace(
                        /-+/g,
                        "-"
                    )
                    .replace(
                        /^-|-$/g,
                        ""
                    )
                    .toLowerCase() ||
                "material";


            const uniqueFileName =
                `${Date.now()}-` +
                `${Math.round(
                    Math.random() *
                    1000000
                )}-` +
                `${safeFileName}` +
                `${extension}`;


            callback(
                null,
                uniqueFileName
            );
        },
    });


const allowedMimeTypes = [
    "application/pdf",
    "application/x-pdf",
    "application/acrobat",
    "applications/vnd.pdf",
    "text/pdf",
    "text/x-pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/octet-stream",
    "application/zip",
    "application/x-zip-compressed",
];


const allowedExtensions = [
    ".pdf",
    ".doc",
    ".docx",
    ".txt",
    ".pptx",
];


const fileFilter = (
    request,
    file,
    callback
) => {
    const extension =
        path
            .extname(
                file.originalname
            )
            .toLowerCase();


    /*
     * Legacy PPT files are not accepted
     * because reliable extraction requires
     * external conversion software.
     */

    if (extension === ".ppt") {
        callback(
            new Error(
                "Old PPT files are not supported. Please convert the presentation to PPTX and upload it again."
            ),
            false
        );

        return;
    }


    const validExtension =
        allowedExtensions.includes(
            extension
        );

    const validMimeType =
        !file.mimetype ||
        allowedMimeTypes.includes(
            file.mimetype
        );


    if (
        validExtension &&
        validMimeType
    ) {
        callback(
            null,
            true
        );

        return;
    }


    callback(
        new Error(
            "Only PDF, DOC, DOCX, TXT and PPTX files are allowed"
        ),
        false
    );
};


const uploadMaterial =
    multer({
        storage,

        fileFilter,

        limits: {
            fileSize:
                10 *
                1024 *
                1024,
        },
    });


module.exports =
    uploadMaterial;