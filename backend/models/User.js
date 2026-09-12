const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const preferencesSchema = new mongoose.Schema(
    {
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
            required: [true, "Name is required"],
            trim: true,
            minlength: 2,
            maxlength: 60,
        },

        email: {
            type: String,
            required: [true, "Email is required"],
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
            required: [true, "Password is required"],
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

        preferences: {
            type: preferencesSchema,
            default: () => ({}),
        },
    },
    {
        timestamps: true,
    }
);

// Password ko database mein save karne se pehle encrypt karega
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(
        this.password,
        salt
    );
});

// Login ke time password compare karega
userSchema.methods.comparePassword = async function (
    enteredPassword
) {
    return bcrypt.compare(
        enteredPassword,
        this.password
    );
};

// JSON response se password automatically remove karega
userSchema.methods.toJSON = function () {
    const userObject = this.toObject();

    delete userObject.password;

    return userObject;
};

module.exports = mongoose.model("User", userSchema);