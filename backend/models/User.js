const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


const preferencesSchema = new mongoose.Schema(
    {
        defaultMode: {
            type: String,
            enum: [
                "MCQ",
                "QUESTION_ANSWER",
                "INTERVIEW",
            ],
            default: "MCQ",
        },

        defaultDifficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            default: "Medium",
        },

        defaultQuestionCount: {
            type: Number,
            min: 1,
            max: 50,
            default: 10,
        },

        showExplanations: {
            type: Boolean,
            default: true,
        },

        emailNotifications: {
            type: Boolean,
            default: true,
        },

        preparationReminders: {
            type: Boolean,
            default: true,
        },
    },
    {
        _id: false,
    }
);


const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [
                true,
                "Name is required",
            ],
            trim: true,
            minlength: 2,
            maxlength: 60,
        },

        email: {
            type: String,
            required: [
                true,
                "Email is required",
            ],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                "Please enter a valid email address",
            ],
        },

        password: {
            type: String,
            required: [
                true,
                "Password is required",
            ],
            minlength: 6,
            select: false,
        },

        role: {
            type: String,
            enum: ["Student", "Admin"],
            default: "Student",
        },

        profileImage: {
            type: String,
            default: "",
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        /* Registration verification */

        emailVerificationOtp: {
            type: String,
            select: false,
            default: null,
        },

        emailVerificationOtpExpiresAt: {
            type: Date,
            select: false,
            default: null,
        },

        emailVerificationOtpSentAt: {
            type: Date,
            select: false,
            default: null,
        },

        /* Password-reset verification */

        passwordResetOtp: {
            type: String,
            select: false,
            default: null,
        },

        passwordResetOtpExpiresAt: {
            type: Date,
            select: false,
            default: null,
        },

        passwordResetOtpSentAt: {
            type: Date,
            select: false,
            default: null,
        },

        passwordResetToken: {
            type: String,
            select: false,
            default: null,
        },

        passwordResetTokenExpiresAt: {
            type: Date,
            select: false,
            default: null,
        },

        preferences: {
            type: preferencesSchema,
            default: () => ({}),
        },
    },
    {
        timestamps: true,
    }
);


/* =========================================================
   HASH PASSWORD
========================================================= */

userSchema.pre(
    "save",
    async function () {
        if (!this.isModified("password")) {
            return;
        }

        const salt =
            await bcrypt.genSalt(10);

        this.password =
            await bcrypt.hash(
                this.password,
                salt
            );
    }
);


/* =========================================================
   COMPARE PASSWORD
========================================================= */

userSchema.methods.comparePassword =
    async function (
        enteredPassword
    ) {
        return bcrypt.compare(
            enteredPassword,
            this.password
        );
    };


/* =========================================================
   REMOVE PRIVATE DATA
========================================================= */

userSchema.methods.toJSON =
    function () {
        const userObject =
            this.toObject();

        delete userObject.password;

        delete userObject.emailVerificationOtp;

        delete userObject
            .emailVerificationOtpExpiresAt;

        delete userObject
            .emailVerificationOtpSentAt;

        delete userObject.passwordResetOtp;

        delete userObject
            .passwordResetOtpExpiresAt;

        delete userObject
            .passwordResetOtpSentAt;

        delete userObject.passwordResetToken;

        delete userObject
            .passwordResetTokenExpiresAt;

        return userObject;
    };


module.exports = mongoose.model(
    "User",
    userSchema
);