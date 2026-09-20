const createTransporter = () => {
    const emailUser =
        process.env.EMAIL_USER;

    const emailPassword =
        process.env.EMAIL_APP_PASSWORD;

    if (!emailUser || !emailPassword) {
        throw new Error(
            "EMAIL_USER or EMAIL_APP_PASSWORD is missing in environment variables"
        );
    }

    return nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        family: 4,

        auth: {
            user: emailUser,
            pass: emailPassword,
        },

        connectionTimeout: 20000,
        greetingTimeout: 20000,
        socketTimeout: 30000,
    });
};