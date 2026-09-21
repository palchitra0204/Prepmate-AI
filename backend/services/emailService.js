/* =========================================================
   BREVO EMAIL CONFIGURATION
========================================================= */

const getEmailConfiguration = () => {
    const apiKey =
        process.env.BREVO_API_KEY;

    const senderEmail =
        process.env.EMAIL_USER;

    const senderName =
        process.env.EMAIL_FROM ||
        "PrepMate AI";

    if (!apiKey) {
        throw new Error(
            "BREVO_API_KEY is missing in environment variables"
        );
    }

    if (!senderEmail) {
        throw new Error(
            "EMAIL_USER is missing in environment variables"
        );
    }

    return {
        apiKey,
        senderEmail,
        senderName,
    };
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
   SEND EMAIL USING BREVO HTTPS API
========================================================= */

const sendEmail = async ({
    email,
    name,
    subject,
    text,
    html,
}) => {
    const {
        apiKey,
        senderEmail,
        senderName,
    } = getEmailConfiguration();

    const response =
        await fetch(
            "https://api.brevo.com/v3/smtp/email",
            {
                method: "POST",

                headers: {
                    accept:
                        "application/json",

                    "content-type":
                        "application/json",

                    "api-key":
                        apiKey,
                },

                body: JSON.stringify({
                    sender: {
                        name:
                            senderName,

                        email:
                            senderEmail,
                    },

                    to: [
                        {
                            email,

                            name:
                                name ||
                                email,
                        },
                    ],

                    subject,

                    textContent:
                        text,

                    htmlContent:
                        html,
                }),
            }
        );

    const responseData =
        await response
            .json()
            .catch(() => ({}));

    if (!response.ok) {
        console.error(
            "Brevo Email Error:",
            response.status,
            responseData
        );

        throw new Error(
            responseData.message ||
            "Unable to send email"
        );
    }

    return responseData;
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
        const expiryMinutes =
            Number(
                process.env
                    .OTP_EXPIRES_MINUTES
            ) || 10;

        const text = `
Hello ${name},

Your PrepMate account verification code is: ${otp}

This code will expire in ${expiryMinutes} minutes.

If you did not create this account, ignore this email.
        `.trim();

        const html =
            createOtpEmailTemplate({
                name,

                heading:
                    "Verify your email",

                description:
                    "use the verification code below to complete your PrepMate registration.",

                otp,

                expiryMinutes,
            });

        return sendEmail({
            email,
            name,

            subject:
                "Verify your PrepMate account",

            text,
            html,
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
        const expiryMinutes =
            Number(
                process.env
                    .OTP_EXPIRES_MINUTES
            ) || 10;

        const text = `
Hello ${name},

Your PrepMate password-reset code is: ${otp}

This code will expire in ${expiryMinutes} minutes.

If you did not request a password reset, ignore this email.
        `.trim();

        const html =
            createOtpEmailTemplate({
                name,

                heading:
                    "Reset your password",

                description:
                    "use the verification code below to reset your PrepMate password.",

                otp,

                expiryMinutes,
            });

        return sendEmail({
            email,
            name,

            subject:
                "Reset your PrepMate password",

            text,
            html,
        });
    };


module.exports = {
    sendRegistrationOtp,
    sendPasswordResetOtp,
};