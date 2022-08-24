'use strict';

import jwt from "jsonwebtoken";
import * as OTPAuth from 'otpauth';
import models from "../database/models";
import Response from "../utils/response";
import SendOTPMail from "../utils/send_otp_mail";
import JoiValidator from "../utils/joi_validator";

const { OTP, Users } = models;


class OTPController {

    //  Send OTP.
    static sendOTPMail = async (req, res) => {

        try {
            const requestBody = req.body;
            // console.log(requestBody);

            //  Validate the Request Body.
            const { error, value } = await JoiValidator.otpSchema.validate(requestBody);
            if (error) {
                const response = new Response(
                    false,
                    400,
                    `${error.message}`
                );
                return res.status(response.code).json(response);
            }
            const { name, email } = value;
            
            // Create a new TOTP object.
            const totp = new OTPAuth.TOTP({
                issuer: 'superpunter.com',
                label: 'SuperPunter',
                algorithm: 'SHA1',
                digits: 6,
                period: 900,
                secret: `${process.env.OTP_SECRET_KEY}` // or "OTPAuth.Secret.fromBase32('NB2W45DFOIZA')"
            })

            // Generate a token.
            const generatedOTP = totp.generate();
            // console.log("GENERATED OTP::: ", generatedOTP);

            //  Save OTP to the DB
            await OTP.create({
                userEmail: email,
                otp: generatedOTP
            });

        
            //  Send OTP to users mail.
            await SendOTPMail.sendMail(name, email, generatedOTP);
            // console.log("EMAIL RESPONSE::: ", emailResponse);


            const response = new Response(
                true,
                201,
                "An OTP has been sent successfully to your email. Kindly check your email for your OTP.",
            );
            return res.status(response.code).json(response);
            
        } catch (error) {
            console.log(`ERROR::: ${error}`);

            const response = new Response(
                false,
                500,
                'Server error, please try again later.'
            );
            return res.status(response.code).json(response);
        }
    }

    
    //  Verify OTP.
    static verifyOTP = async (req, res) => {

        try {
            const { id } = req.params;
            const requestBody = req.body;
            // console.log(requestBody);

            //  Validate the Request Body.
            const { error, value } = await JoiValidator.verifyOTPSchema.validate(requestBody);
            if (error) {
                const response = new Response(
                    false,
                    400,
                    `${error.message}`
                );
                return res.status(response.code).json(response);
            }
            const { email, otp } = value;

            // Create a new TOTP object.
            const totp = new OTPAuth.TOTP({
                issuer: 'superpunter.com',
                label: 'SuperPunter',
                algorithm: 'SHA1',
                digits: 6,
                period: 900,
                secret: `${process.env.OTP_SECRET_KEY}`
            })

            // Validate an OTP.
            const validatedOTP = totp.validate({
                token: otp,
                window: 1
            });
            if (validatedOTP === null) {
                const response = new Response(
                    false,
                    400,
                    "The OTP is invalid or expired, kindly request for an OTP."
                );
                return res.status(response.code).json(response);
            }
            // console.log("VALIDATED::: ", validatedOTP);


            //  Update the User "isVerified" property.
            const updatedUser = await Users.update({ "isVerified": true }, { where: { id , email} });
            if (updatedUser[0] === 0) {
                const response = new Response(
                    false,
                    400,
                    "Failed to verify your account."
                );
                return res.status(response.code).json(response);
            }


            //  Delete the Users OTP.
            await OTP.destroy({
                where: { userEmail: email }
            });


            //  Fetch the user.
            const user = await Users.findOne({
                where: { id },
                attributes: {
                    exclude: ["password"]
                }
            });
            const { name, phone, role } = user;


            //  Now remove the "password" before returning the User.
            const userDataValues = user.dataValues;
            delete userDataValues.pictureId;


            //  Create a Token that will be passed to the response.
            const token = jwt.sign(
                { id, name, email, phone, role },
                `${process.env.JWT_SECRET_KEY}`,
            );

            const response = new Response(
                true,
                200,
                "Successfully verified your account.",
                { ...userDataValues, token }
            );
            return res.status(response.code).json(response);
            
        } catch (error) {
            console.log(`ERROR::: ${error}`);

            const response = new Response(
                false,
                500,
                'Server error, please try again later.'
            );
            return res.status(response.code).json(response);
        }
    }
 };

 export default OTPController;