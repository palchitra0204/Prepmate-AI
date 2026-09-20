const nodemailer = require("nodemailer");


/* =========================================================
   TRANSPORTER
========================================================= */

const createTransporter = () => {
    const emailUser =
        process.env.EMAIL_USER;

    const emailPassword =
        process.env.EMAIL_APP_PASSWORD;


    if (!emailUser || !emailPassword) {
        throw new Error(
            "EMAIL_USER or EMAIL_APP_PASSWORD is missing in the .env file"
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


/* =========================================================
   COMMON EMAIL TEMPLATE
========================================================= */

const createOtpEmailTemplate = ({
    name,
    heading,
    description,
    otp,
    expiryMinutes,
}) => {
    return `
    <div
      style="
        margin: 0;
        padding: 35px 18px;
        background: #f7f4fa;
        font-family: Arial, sans-serif;
      "
    >
      <div
        style="
          max-width: 520px;
          margin: 0 auto;
          padding: 32px;
          border: 1px solid #e4d8f4;
          border-radius: 18px;
          background: #ffffff;
        "
      >
        <div
          style="
            margin-bottom: 22px;
            color: #7133d9;
            font-size: 22px;
            font-weight: 700;
          "
        >
          PrepMate AI
        </div>

        <h1
          style="
            margin: 0 0 12px;
            color: #24202a;
            font-size: 24px;
          "
        >
          ${heading}
        </h1>

        <p
          style="
            margin: 0;
            color: #6d6673;
            font-size: 15px;
            line-height: 1.7;
          "
        >
          Hello ${name}, ${description}
        </p>

        <div
          style="
            margin: 27px 0;
            padding: 18px;
            color: #7133d9;
            border: 1px solid #d8c1f6;
            border-radius: 12px;
            background: #f8f3ff;
            font-size: 32px;
            font-weight: 800;
            letter-spacing: 10px;
            text-align: center;
          "
        >
          ${otp}
        </div>

        <p
          style="
            margin: 0;
            color: #77717d;
            font-size: 13px;
            line-height: 1.6;
          "
        >
          This code will expire in
          ${expiryMinutes} minutes.
          Never share this code with anyone.
        </p>
      </div>
    </div>
  `;
};


/* =========================================================
   SEND REGISTRATION OTP
========================================================= */

const sendRegistrationOtp =
    async ({
        email,
        name,
        otp,
    }) => {
        const transporter =
            createTransporter();


        const senderName =
            process.env.EMAIL_FROM ||
            "PrepMate AI";


        const expiryMinutes =
            Number(
                process.env.OTP_EXPIRES_MINUTES
            ) || 10;


        await transporter.sendMail({
            from:
                `"${senderName}" ` +
                `<${process.env.EMAIL_USER}>`,

            to: email,

            subject:
                "Verify your PrepMate account",

            text: `
Hello ${name},

Your PrepMate account verification code is: ${otp}

This code will expire in ${expiryMinutes} minutes.

If you did not create this account, ignore this email.
      `.trim(),

            html:
                createOtpEmailTemplate({
                    name,

                    heading:
                        "Verify your email",

                    description:
                        "use the verification code below to complete your PrepMate registration.",

                    otp,

                    expiryMinutes,
                }),
        });
    };


/* =========================================================
   SEND PASSWORD RESET OTP
========================================================= */

const sendPasswordResetOtp =
    async ({
        email,
        name,
        otp,
    }) => {
        const transporter =
            createTransporter();


        const senderName =
            process.env.EMAIL_FROM ||
            "PrepMate AI";


        const expiryMinutes =
            Number(
                process.env.OTP_EXPIRES_MINUTES
            ) || 10;


        await transporter.sendMail({
            from:
                `"${senderName}" ` +
                `<${process.env.EMAIL_USER}>`,

            to: email,

            subject:
                "Reset your PrepMate password",

            text: `
Hello ${name},

Your PrepMate password-reset code is: ${otp}

This code will expire in ${expiryMinutes} minutes.

If you did not request a password reset, ignore this email.
      `.trim(),

            html:
                createOtpEmailTemplate({
                    name,

                    heading:
                        "Reset your password",

                    description:
                        "use the verification code below to reset your PrepMate password.",

                    otp,

                    expiryMinutes,
                }),
        });
    };


module.exports = {
    sendRegistrationOtp,
    sendPasswordResetOtp,
};