const bcrypt = require("bcryptjs");

const User = require("../models/User");

const getProfile = async (
    req,
    res
) => {
    try {
        const user = await User.findById(
            req.user._id
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error(
            "Get Profile Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Unable to load profile",
        });
    }
};

const updateProfile = async (
    req,
    res
) => {
    try {
        const { name, email } = req.body;

        const user = await User.findById(
            req.user._id
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (name !== undefined) {
            const cleanName = name.trim();

            if (cleanName.length < 2) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Name must contain at least 2 characters",
                });
            }

            user.name = cleanName;
        }

        if (email !== undefined) {
            const cleanEmail = email
                .trim()
                .toLowerCase();

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (
                !emailPattern.test(cleanEmail)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Please enter a valid email address",
                });
            }

            const existingUser =
                await User.findOne({
                    email: cleanEmail,

                    _id: {
                        $ne: user._id,
                    },
                });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Email address is already registered",
                });
            }

            user.email = cleanEmail;
        }

        await user.save();

        const updatedUser =
            await User.findById(
                user._id
            ).select("-password");

        return res.status(200).json({
            success: true,
            message:
                "Profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error(
            "Update Profile Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Unable to update profile",
        });
    }
};

const changePassword = async (
    req,
    res
) => {
    try {
        const {
            currentPassword,
            newPassword,
            confirmPassword,
        } = req.body;

        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Please provide all password fields",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must contain at least 6 characters",
            });
        }

        if (
            newPassword !== confirmPassword
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "New passwords do not match",
            });
        }

        const user = await User.findById(
            req.user._id
        ).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const passwordMatches =
            await bcrypt.compare(
                currentPassword,
                user.password
            );

        if (!passwordMatches) {
            return res.status(400).json({
                success: false,
                message:
                    "Current password is incorrect",
            });
        }

        user.password = newPassword;

        await user.save();

        return res.status(200).json({
            success: true,
            message:
                "Password changed successfully",
        });
    } catch (error) {
        console.error(
            "Change Password Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Unable to change password",
        });
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
};