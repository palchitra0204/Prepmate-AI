const express = require("express");

const {
  registerUser,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  loginUser,
  forgotPassword,
  verifyPasswordResetOtp,
  resetPassword,
} = require(
  "../controllers/authController"
);


const router =
  express.Router();


/* Registration */

router.post(
  "/register",
  registerUser
);


router.post(
  "/verify-registration-otp",
  verifyRegistrationOtp
);


router.post(
  "/resend-registration-otp",
  resendRegistrationOtp
);


/* Login */

router.post(
  "/login",
  loginUser
);


/* Forgot password */

router.post(
  "/forgot-password",
  forgotPassword
);


router.post(
  "/verify-reset-otp",
  verifyPasswordResetOtp
);


router.post(
  "/reset-password",
  resetPassword
);


module.exports = router;