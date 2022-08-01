'use strict';

import { Router } from 'express';
import OTPController from '../controllers/otp_controller';
import TokenVerification from "../utils/token_verification";

//  Set up Express Router.
const otpRouter = Router();

//  Send OTP.
otpRouter.post(
    "/send_otp",
    OTPController.sendOTPMail
);

//  Verify OTP.
otpRouter.post(
    "/verify_otp/:id",
    TokenVerification.userTokenValidation,
    OTPController.verifyOTP
);


export default otpRouter;