const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const {
    sendRegistrationOtp,
    sendPasswordResetOtp,
} = require("../services/emailService");


/* =========================================================
   HELPERS
========================================================= */

const generateToken = (userId) => {
    if (!process.env.JWT_SECRET) {
        throw new Error(
            "JWT_SECRET is missing in the .env file"
        );
    }

    return jwt.sign(
        {
            id: userId.toString(),
        },
        process.env.JWT_SECRET,
        {
            expiresIn:
                process.env.JWT_EXPIRES_IN ||
                "7d",
        }
    );
};


const generateOtp = () => {
    return crypto
        .randomInt(100000, 1000000)
        .toString();
};


const generateResetToken = () => {
    return crypto
        .randomBytes(32)
        .toString("hex");
};


const hashValue = (value) => {
    return crypto
        .createHash("sha256")
        .update(String(value))
        .digest("hex");
};


const valuesMatch = (
    plainValue,
    storedHash
) => {
    if (!plainValue || !storedHash) {
        return false;
    }

    const receivedBuffer =
        Buffer.from(
            hashValue(plainValue),
            "hex"
        );

    const storedBuffer =
        Buffer.from(
            storedHash,
            "hex"
        );

    return (
        receivedBuffer.length ===
        storedBuffer.length &&
        crypto.timingSafeEqual(
            receivedBuffer,
            storedBuffer
        )
    );
};


const getOtpExpiryDate = () => {
    const expiryMinutes =
        Number(
            process.env.OTP_EXPIRES_MINUTES
        ) || 10;

    return new Date(
        Date.now() +
        expiryMinutes * 60 * 1000
    );
};


const formatUser = (user) => {
    return {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,

        profileImage:
            user.profileImage || "",

        isEmailVerified:
            user.isEmailVerified,

        preferences:
            user.preferences,

        createdAt:
            user.createdAt,
    };
};


/* =========================================================
   REGISTER USER
========================================================= */

const registerUser = async (
    req,
    res
) => {
    try {
        const {
            name,
            email,
            password,
            confirmPassword,
        } = req.body;

        if (
            !name ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please fill all required fields",
            });
        }

        const cleanedName =
            name.trim();

        const normalizedEmail =
            email.trim().toLowerCase();

        if (cleanedName.length < 2) {
            return res.status(400).json({
                success: false,
                message:
                    "Name must be at least 2 characters",
            });
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !emailPattern.test(
                normalizedEmail
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please enter a valid email address",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 6 characters",
            });
        }

        if (
            password !== confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Password and confirm password do not match",
            });
        }

        let user =
            await User.findOne({
                email:
                    normalizedEmail,
            }).select(
                "+password " +
                "+emailVerificationOtp " +
                "+emailVerificationOtpExpiresAt " +
                "+emailVerificationOtpSentAt"
            );

        if (
            user &&
            user.isEmailVerified
        ) {
            return res.status(409).json({
                success: false,
                message:
                    "An account already exists with this email",
            });
        }

        const otp =
            generateOtp();

        if (user) {
            user.name =
                cleanedName;

            user.password =
                password;

            user.emailVerificationOtp =
                hashValue(otp);

            user.emailVerificationOtpExpiresAt =
                getOtpExpiryDate();

            user.emailVerificationOtpSentAt =
                new Date();

            await user.save();

        } else {
            user = await User.create({
                name:
                    cleanedName,

                email:
                    normalizedEmail,

                password,

                isEmailVerified:
                    false,

                emailVerificationOtp:
                    hashValue(otp),

                emailVerificationOtpExpiresAt:
                    getOtpExpiryDate(),

                emailVerificationOtpSentAt:
                    new Date(),
            });
        }

        try {
            await sendRegistrationOtp({
                email:
                    user.email,

                name:
                    user.name,

                otp,
            });

        } catch (emailError) {
            console.error(
                "Registration Email Error:",
                emailError
            );

            return res.status(500).json({
                success: false,
                message:
                    "Account details were saved, but verification email could not be sent. Please use Resend OTP.",
            });
        }

        return res.status(201).json({
            success: true,
            requiresVerification:
                true,
            email:
                user.email,
            message:
                "Verification code sent to your email",
        });

    } catch (error) {
        console.error(
            "Register Error:",
            error
        );

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "An account already exists with this email",
            });
        }

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Registration failed",
        });
    }
};


/* =========================================================
   VERIFY REGISTRATION OTP
========================================================= */

const verifyRegistrationOtp =
    async (
        req,
        res
    ) => {
        try {
            const {
                email,
                otp,
            } = req.body;

            if (!email || !otp) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Email and verification code are required",
                });
            }

            const normalizedEmail =
                email.trim().toLowerCase();

            const cleanedOtp =
                String(otp).trim();

            if (!/^\d{6}$/.test(cleanedOtp)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Please enter a valid 6-digit verification code",
                });
            }

            const user =
                await User.findOne({
                    email:
                        normalizedEmail,
                }).select(
                    "+emailVerificationOtp " +
                    "+emailVerificationOtpExpiresAt"
                );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Registration request not found",
                });
            }

            if (user.isEmailVerified) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Email is already verified. Please login.",
                });
            }

            if (
                !user.emailVerificationOtp ||
                !user.emailVerificationOtpExpiresAt
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Verification code is unavailable. Please request a new code.",
                });
            }

            if (
                user.emailVerificationOtpExpiresAt <
                new Date()
            ) {
                return res.status(410).json({
                    success: false,
                    message:
                        "Verification code has expired. Please request a new code.",
                });
            }

            if (
                !valuesMatch(
                    cleanedOtp,
                    user.emailVerificationOtp
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Incorrect verification code",
                });
            }

            user.isEmailVerified =
                true;

            user.emailVerificationOtp =
                null;

            user.emailVerificationOtpExpiresAt =
                null;

            user.emailVerificationOtpSentAt =
                null;

            await user.save();

            const token =
                generateToken(user._id);

            return res.status(200).json({
                success: true,
                message:
                    "Email verified and account created successfully",
                token,
                user:
                    formatUser(user),
            });

        } catch (error) {
            console.error(
                "Verify Registration OTP Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "Unable to verify email",
            });
        }
    };


/* =========================================================
   RESEND REGISTRATION OTP
========================================================= */

const resendRegistrationOtp =
    async (
        req,
        res
    ) => {
        try {
            const { email } =
                req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Email address is required",
                });
            }

            const normalizedEmail =
                email.trim().toLowerCase();

            const user =
                await User.findOne({
                    email:
                        normalizedEmail,
                }).select(
                    "+emailVerificationOtp " +
                    "+emailVerificationOtpExpiresAt " +
                    "+emailVerificationOtpSentAt"
                );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Registration request not found",
                });
            }

            if (user.isEmailVerified) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Email is already verified. Please login.",
                });
            }

            if (
                user.emailVerificationOtpSentAt &&
                Date.now() -
                new Date(
                    user.emailVerificationOtpSentAt
                ).getTime() <
                60000
            ) {
                return res.status(429).json({
                    success: false,
                    message:
                        "Please wait 60 seconds before requesting another code",
                });
            }

            const otp =
                generateOtp();

            user.emailVerificationOtp =
                hashValue(otp);

            user.emailVerificationOtpExpiresAt =
                getOtpExpiryDate();

            user.emailVerificationOtpSentAt =
                new Date();

            await user.save();

            await sendRegistrationOtp({
                email:
                    user.email,
                name:
                    user.name,
                otp,
            });

            return res.status(200).json({
                success: true,
                message:
                    "A new verification code has been sent",
            });

        } catch (error) {
            console.error(
                "Resend Registration OTP Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "Unable to resend verification code",
            });
        }
    };


/* =========================================================
   LOGIN USER
========================================================= */

const loginUser = async (
    req,
    res
) => {
    try {
        const {
            email,
            password,
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required",
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const user =
            await User.findOne({
                email:
                    normalizedEmail,
            }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password",
            });
        }

        const passwordMatched =
            await user.comparePassword(
                password
            );

        if (!passwordMatched) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password",
            });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                requiresVerification:
                    true,
                email:
                    user.email,
                message:
                    "Please verify your email before logging in",
            });
        }

        const token =
            generateToken(user._id);

        return res.status(200).json({
            success: true,
            message:
                "Login successful",
            token,
            user:
                formatUser(user),
        });

    } catch (error) {
        console.error(
            "Login Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Login failed",
        });
    }
};


/* =========================================================
   FORGOT PASSWORD - SEND OTP
========================================================= */

const forgotPassword = async (
    req,
    res
) => {
    try {
        const { email } =
            req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message:
                    "Email address is required",
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const user =
            await User.findOne({
                email:
                    normalizedEmail,
            }).select(
                "+passwordResetOtp " +
                "+passwordResetOtpExpiresAt " +
                "+passwordResetOtpSentAt"
            );

        /*
         * Use a general response when the email
         * does not exist. This prevents account
         * enumeration.
         */
        if (!user) {
            return res.status(200).json({
                success: true,
                email:
                    normalizedEmail,
                message:
                    "If an account exists with this email, a password-reset code has been sent.",
            });
        }

        if (
            user.passwordResetOtpSentAt &&
            Date.now() -
            new Date(
                user.passwordResetOtpSentAt
            ).getTime() <
            60000
        ) {
            return res.status(429).json({
                success: false,
                message:
                    "Please wait 60 seconds before requesting another code",
            });
        }

        const otp =
            generateOtp();

        user.passwordResetOtp =
            hashValue(otp);

        user.passwordResetOtpExpiresAt =
            getOtpExpiryDate();

        user.passwordResetOtpSentAt =
            new Date();

        user.passwordResetToken =
            null;

        user.passwordResetTokenExpiresAt =
            null;

        await user.save();

        await sendPasswordResetOtp({
            email:
                user.email,
            name:
                user.name,
            otp,
        });

        return res.status(200).json({
            success: true,
            email:
                user.email,
            message:
                "Password-reset code sent to your email",
        });

    } catch (error) {
        console.error(
            "Forgot Password Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Unable to send password-reset code",
        });
    }
};


/* =========================================================
   VERIFY PASSWORD RESET OTP
========================================================= */

const verifyPasswordResetOtp =
    async (
        req,
        res
    ) => {
        try {
            const {
                email,
                otp,
            } = req.body;

            if (!email || !otp) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Email and verification code are required",
                });
            }

            const normalizedEmail =
                email.trim().toLowerCase();

            const cleanedOtp =
                String(otp).trim();

            if (!/^\d{6}$/.test(cleanedOtp)) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Please enter a valid 6-digit verification code",
                });
            }

            const user =
                await User.findOne({
                    email:
                        normalizedEmail,
                }).select(
                    "+passwordResetOtp " +
                    "+passwordResetOtpExpiresAt"
                );

            if (
                !user ||
                !user.passwordResetOtp ||
                !user.passwordResetOtpExpiresAt
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Password-reset request is invalid. Please request a new code.",
                });
            }

            if (
                user.passwordResetOtpExpiresAt <
                new Date()
            ) {
                return res.status(410).json({
                    success: false,
                    message:
                        "Password-reset code has expired. Please request a new code.",
                });
            }

            if (
                !valuesMatch(
                    cleanedOtp,
                    user.passwordResetOtp
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Incorrect password-reset code",
                });
            }

            const resetToken =
                generateResetToken();

            user.passwordResetToken =
                hashValue(resetToken);

            user.passwordResetTokenExpiresAt =
                new Date(
                    Date.now() +
                    15 * 60 * 1000
                );

            user.passwordResetOtp =
                null;

            user.passwordResetOtpExpiresAt =
                null;

            user.passwordResetOtpSentAt =
                null;

            await user.save();

            return res.status(200).json({
                success: true,
                resetToken,
                message:
                    "Code verified. You can now create a new password.",
            });

        } catch (error) {
            console.error(
                "Verify Reset OTP Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    error.message ||
                    "Unable to verify password-reset code",
            });
        }
    };


/* =========================================================
   RESET PASSWORD
========================================================= */

const resetPassword = async (
    req,
    res
) => {
    try {
        const {
            email,
            resetToken,
            newPassword,
            confirmPassword,
        } = req.body;

        if (
            !email ||
            !resetToken ||
            !newPassword ||
            !confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please fill all required fields",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be at least 6 characters",
            });
        }

        if (
            newPassword !==
            confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "New password and confirm password do not match",
            });
        }

        const normalizedEmail =
            email.trim().toLowerCase();

        const user =
            await User.findOne({
                email:
                    normalizedEmail,
            }).select(
                "+password " +
                "+passwordResetToken " +
                "+passwordResetTokenExpiresAt"
            );

        if (
            !user ||
            !user.passwordResetToken ||
            !user.passwordResetTokenExpiresAt
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Password-reset request is invalid. Please start again.",
            });
        }

        if (
            user.passwordResetTokenExpiresAt <
            new Date()
        ) {
            return res.status(410).json({
                success: false,
                message:
                    "Password-reset session has expired. Please start again.",
            });
        }

        if (
            !valuesMatch(
                resetToken,
                user.passwordResetToken
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid password-reset session",
            });
        }

        user.password =
            newPassword;

        user.passwordResetToken =
            null;

        user.passwordResetTokenExpiresAt =
            null;

        user.passwordResetOtp =
            null;

        user.passwordResetOtpExpiresAt =
            null;

        user.passwordResetOtpSentAt =
            null;

        await user.save();

        return res.status(200).json({
            success: true,
            message:
                "Password changed successfully. You can now login.",
        });

    } catch (error) {
        console.error(
            "Reset Password Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Unable to reset password",
        });
    }
};


module.exports = {
    registerUser,
    verifyRegistrationOtp,
    resendRegistrationOtp,
    loginUser,
    forgotPassword,
    verifyPasswordResetOtp,
    resetPassword,
};