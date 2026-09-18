const fs = require("fs");
const mongoose = require("mongoose");

const Material = require("../models/Material");

const Preparation = require(
  "../models/Preparation"
);

const {
  extractTextFromFile,
} = require(
  "../services/fileProcessingService"
);


/* =========================================================
   UPLOAD MATERIAL
========================================================= */

const uploadMaterial = async (
  req,
  res
) => {
  let material = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Please select a PDF, DOCX or TXT file",
      });
    }


    const extension =
      req.file.originalname
        .split(".")
        .pop()
        .toUpperCase();


    let fileType;


    if (extension === "PDF") {
      fileType = "PDF";

    } else if (
      extension === "DOCX" ||
      extension === "DOC"
    ) {
      fileType = "DOCX";

    } else if (
      extension === "TXT"
    ) {
      fileType = "TXT";

    } else if (
      extension === "PPTX"
    ) {
      fileType = "PPTX";

    } else {
      if (
        req.file.path &&
        fs.existsSync(
          req.file.path
        )
      ) {
        fs.unlinkSync(
          req.file.path
        );
      }


      return res.status(400).json({
        success: false,
        message:
          "Please select a PDF, DOC, DOCX, TXT or PPTX file", 
      });
    }


    const title =
      req.body.title?.trim() ||
      req.file.originalname.replace(
        /\.[^/.]+$/,
        ""
      );


    material =
      await Material.create({
        user:
          req.user._id,

        title,

        originalFileName:
          req.file.originalname,

        storedFileName:
          req.file.filename,

        filePath:
          req.file.path,

        fileType,

        mimeType:
          req.file.mimetype,

        fileSize:
          req.file.size,

        status:
          "Processing",
      });


    try {
      const extractedText =
        await extractTextFromFile(
          req.file.path,
          fileType
        );


      if (
        !extractedText?.trim()
      ) {
        throw new Error(
          "No readable text was found in the uploaded file"
        );
      }


      material.extractedText =
        extractedText.trim();

      material.status =
        "Ready";

      material.processingError =
        "";

      material.processedAt =
        new Date();


      await material.save();


      return res
        .status(201)
        .json({
          success: true,

          message:
            "Material uploaded and processed successfully",

          material: {
            id:
              material._id,

            _id:
              material._id,

            title:
              material.title,

            originalFileName:
              material.originalFileName,

            fileType:
              material.fileType,

            mimeType:
              material.mimeType,

            fileSize:
              material.fileSize,

            status:
              material.status,

            processedAt:
              material.processedAt,

            createdAt:
              material.createdAt,
          },
        });

    } catch (
      processingError
    ) {
      material.status =
        "Failed";

      material.processingError =
        processingError.message ||
        "Text extraction failed";


      await material.save();


      return res
        .status(422)
        .json({
          success: false,

          message:
            "File uploaded, but text processing failed",

          error:
            processingError.message ||
            "Text extraction failed",

          material: {
            id:
              material._id,

            _id:
              material._id,

            title:
              material.title,

            status:
              material.status,
          },
        });
    }

  } catch (error) {
    if (
      !material &&
      req.file?.path &&
      fs.existsSync(
        req.file.path
      )
    ) {
      try {
        fs.unlinkSync(
          req.file.path
        );
      } catch (
        cleanupError
      ) {
        console.error(
          "Upload cleanup error:",
          cleanupError
        );
      }
    }


    console.error(
      "Upload Material Error:",
      error
    );


    return res
      .status(500)
      .json({
        success: false,

        message:
          error.message ||
          "Unable to upload material",
      });
  }
};


/* =========================================================
   GET ALL MATERIALS
========================================================= */

const getMaterials = async (
  req,
  res
) => {
  try {
    const materials =
      await Material.find({
        user:
          req.user._id,
      })
        .select(
          "-extractedText -filePath -storedFileName"
        )
        .sort({
          createdAt:
            -1,
        });


    return res
      .status(200)
      .json({
        success: true,

        count:
          materials.length,

        materials,
      });

  } catch (error) {
    console.error(
      "Get Materials Error:",
      error
    );


    return res
      .status(500)
      .json({
        success: false,

        message:
          error.message ||
          "Unable to load materials",
      });
  }
};


/* =========================================================
   GET ONE MATERIAL
========================================================= */

const getMaterialById = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;


    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Invalid material ID",
        });
    }


    const material =
      await Material.findOne({
        _id:
          id,

        user:
          req.user._id,
      }).select(
        "-extractedText -filePath -storedFileName"
      );


    if (!material) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Material not found",
        });
    }


    return res
      .status(200)
      .json({
        success: true,
        material,
      });

  } catch (error) {
    console.error(
      "Get Material Error:",
      error
    );


    return res
      .status(500)
      .json({
        success: false,

        message:
          error.message ||
          "Unable to load material",
      });
  }
};


/* =========================================================
   UPDATE MATERIAL
========================================================= */

const updateMaterial = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    const {
      title,
    } = req.body;


    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Invalid material ID",
        });
    }


    if (
      !title?.trim()
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Material title is required",
        });
    }


    const material =
      await Material.findOneAndUpdate(
        {
          _id:
            id,

          user:
            req.user._id,
        },

        {
          title:
            title.trim(),
        },

        {
          new: true,
          runValidators: true,
        }
      ).select(
        "-extractedText -filePath -storedFileName"
      );


    if (!material) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Material not found",
        });
    }


    return res
      .status(200)
      .json({
        success: true,

        message:
          "Material updated successfully",

        material,
      });

  } catch (error) {
    console.error(
      "Update Material Error:",
      error
    );


    return res
      .status(500)
      .json({
        success: false,

        message:
          error.message ||
          "Unable to update material",
      });
  }
};


/* =========================================================
   DELETE MATERIAL
========================================================= */

const deleteMaterial = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;


    console.log(
      "Delete request received for material:",
      id
    );


    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Invalid material ID",
        });
    }


    const material =
      await Material.findOne({
        _id:
          id,

        user:
          req.user._id,
      }).select(
        "+filePath"
      );


    if (!material) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Material not found",
        });
    }


    /*
     * First delete all generated
     * preparation records.
     */

    await Preparation.deleteMany({
      material:
        material._id,

      user:
        req.user._id,
    });


    /*
     * Delete material from MongoDB.
     *
     * Database deletion is done BEFORE
     * physical file deletion so a missing
     * or locked file cannot stop the
     * material from being removed.
     */

    await Material.deleteOne({
      _id:
        material._id,

      user:
        req.user._id,
    });


    /*
     * Physical file cleanup.
     *
     * If the file is missing/locked,
     * we log it but DON'T fail the
     * entire delete request.
     */

    if (material.filePath) {
      try {
        if (
          fs.existsSync(
            material.filePath
          )
        ) {
          fs.unlinkSync(
            material.filePath
          );

          console.log(
            "Physical file deleted:",
            material.filePath
          );
        }

      } catch (
        fileError
      ) {
        console.error(
          "Physical File Delete Error:",
          fileError.message
        );
      }
    }


    console.log(
      "Material deleted successfully:",
      id
    );


    return res
      .status(200)
      .json({
        success: true,

        message:
          "Material and its preparation history deleted successfully",

        deletedMaterialId:
          id,
      });

  } catch (error) {
    console.error(
      "Delete Material Error:",
      error
    );


    return res
      .status(500)
      .json({
        success: false,

        message:
          error.message ||
          "Unable to delete material",
      });
  }
};


module.exports = {
  uploadMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
};