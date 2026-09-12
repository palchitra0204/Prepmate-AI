const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");
const connectDatabase = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDatabase();

        app.listen(PORT, () => {
            console.log(
                `PrepMate AI server running on port ${PORT}`
            );

            console.log(
                `Backend URL: http://localhost:${PORT}`
            );
        });
    } catch (error) {
        console.error(
            "Server Start Error:",
            error.message
        );

        process.exit(1);
    }
};

startServer();