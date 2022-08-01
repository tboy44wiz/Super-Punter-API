
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import * as OTPAuth from 'otpauth';
import models from "../database/models";
import Response from "../utils/response";
import SendOTPMail from "../utils/send_otp_mail";
import JoiValidator from "../utils/joi_validator";
import cloudinary from "../config/cloudinaryConfig";

const { Users, OTP } = models;

class UsersController {

    //  Users Signup.
    static signupUser = async (req, res) => {
        try {
            const requestBody = req.body;

            //  Validate the Request Body.
            const { error, value } = JoiValidator.usersSchema.validate(requestBody);
            if (error) {
                const response = new Response(
                    false,
                    400,
                    `${error.message}`
                );
                return res.status(response.code).json(response);
            }

            //  Delete "confirmPassword" before creating user.
            delete value.confirmPassword;

            //  Check if User already exist and create a new Users.
            const [user, created] = await Users.findOrCreate({
                where: { email: value.email },
                defaults: { ...value }
            });
            if (!created) {
                const response = new Response(
                    false,
                    409,
                    "User already registered. Kindly login with your credentials."
                );
                return res.status(response.code).json(response);
            }
            const { id, name, email, phone, role } = user;
            
            //  Create a Token.
            const token = jwt.sign(
                { id, name, email, phone, role },
                `${process.env.JWT_SECRET_KEY}`,
                { expiresIn: "1d" }
            );

            // Create a new TOTP object.
            const totp = new OTPAuth.TOTP({
                issuer: 'superpunter.com',
                label: 'SuperPunter',
                algorithm: 'SHA1',
                digits: 6,
                period: 900,
                secret: `${process.env.OTP_SECRET_KEY}`
            });

            // Generate a Six diigits token.
            const generatedOTP = totp.generate();

            //  Save OTP to the DB
            await OTP.create({
                userEmail: email,
                otp: generatedOTP
            });
            // console.log("GEN OTP::: ", generatedOTP);

        
            //  Send OTP to users mail.
            await SendOTPMail.sendMail(name, email, generatedOTP);
            // const emailResponse = await SendOTPMail.sendMail(name, email, generatedOTP);
            // console.log("EMAIL RESPONSE::: ", emailResponse);


            const response = new Response(
                true,
                201,
                "Successfully sent an OTP to your email. Kindly check your email for your OTP.",
                { ...user.dataValues, token }
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
    };

    //  User Login.
    static loginUser = async (req, res) => {
        try {
            const requestBody = req.body;

            //  Validate the Request Body.
            const { error, value } = JoiValidator.usersLoginSchema.validate(requestBody);
            if (error) {
                const response = new Response(
                    false,
                    400,
                    `${error.message}`
                );
                return res.status(response.code).json(response);
            }

            //  Find the user.
            const user = await Users.findOne({
                where: { email: value.email },
            });
            if (!user) {
                const response = new Response(
                    false,
                    404,
                    "User does not exist."
                );
                return res.status(response.code).json(response);
            }
            const { id, name, email, phone, role } = user;


            //  Compare the encrypted password.
            const isPasswordMatched = bcrypt.compareSync(value.password, user.password);
            if (!isPasswordMatched) {
                const response = new Response(
                    false,
                    401,
                    "Incorrect password. Please check your password and try again."
                );
                return res.status(response.code).json(response);
            }

            //  Create a Token that will be passed to the response.
            const token = jwt.sign(
                { id, name, email, phone, role },
                `${process.env.JWT_SECRET_KEY}`,
            );

            //  Now remove the "password" before returning the User.
            const userDataValues = user.dataValues;
            delete userDataValues.password;
            delete userDataValues.pictureId;

            //  Check if user is verified.
            if (user.isVerified === false) {
                const response = new Response(
                    true,
                    200,
                    "Account is not verified. Kindly check your email for your OTP.",
                    { ...userDataValues, token }
                );
                return res.status(response.code).json(response);
            }

            const response = new Response(
                true,
                200,
                "You're logged in successfully.",
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
    };

    //  Get all Users.
    static getAllUsers = async (req, res) => {
        try {
            const users = await Users.findAll({
                attributes: {
                    exclude: ["password", "pictureId"]
                }
            });
            if (!users.length) {
                const response = new Response(
                    false,
                    404,
                    "No user found."
                );
                return res.status(response.code).json(response);
            }

            const response = new Response(
                true,
                200,
                'Users retrieved successfully.',
                users
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
    };

    //  Get all Audience.
    static getAllAudience = async (req, res) => {
        try {
            const audience = await Users.findAll({
                where: {role: "Audience"},
                attributes: {
                    exclude: ["password", "pictureId"]
                }
            });
            if (!audience.length) {
                const response = new Response(
                    false,
                    404,
                    "No audience found."
                );
                return res.status(response.code).json(response);
            }

            const response = new Response(
                true,
                200,
                'Audience retrieved successfully.',
                audience
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
    };

    //  Get all Punters.
    static getAllPunters = async (req, res) => {
        try {
            const punters = await Users.findAll({
                where: {role: "Punter"},
                attributes: {
                    exclude: ["password", "pictureId"]
                }
            });
            if (!punters.length) {
                const response = new Response(
                    false,
                    404,
                    "No punters found."
                );
                return res.status(response.code).json(response);
            }

            const response = new Response(
                true,
                200,
                'Punters retrieved successfully.',
                punters
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
    };

    //  Get a single User.
    static getSingleUser = async (req, res) => {
        try {
            const { id } = req.params;

            const user = await Users.findOne({
                where: { id },
                attributes: {
                    exclude: ["password", "pictureId"]
                }
            });
            if (!user) {
                const response = new Response(
                    false,
                    404,
                    "User does not exist."
                );
                return res.status(response.code).json(response);
            }

            const response = new Response(
                true,
                200,
                'User retrieved successfully.',
                user
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
    };

    //  Update a User.
    static updateUser = async (req, res) => {
        try {
            const { id : payLoadId } = req.requestPayload;
            const { id } = req.params;
            const requestBody = req.body;
            // console.log(payLoadId);

            //  Validate the Request Body.
            const { error, value } = JoiValidator.usersUpdateSchema.validate(requestBody);
            if (error) {
                const response = new Response(
                    false,
                    400,
                    `${error.message}`
                );
                return res.status(response.code).json(response);
            }

            if (value.email) {
                const foundItem = await Users.findOne({
                    where: { id }
                });

                //  First check if the user Email is changed.
                if (foundItem.email === value.email) {
                    const updatedUser = await Users.update({ ...value }, { where: { id } });
                    if (updatedUser[0] === 0) {
                        const response = new Response(
                            false,
                            400,
                            "Failed to update user."
                        );
                        return res.status(response.code).json(response);
                    }

                    //  Get the user back.
                    const user = await Users.findOne({
                        where: { id },
                        attributes: {
                            exclude: ["password", "pictureId"]
                        }
                    });
                    const { name, email, phone, role } = user;

                    //  Create a Token that will be passed to the response.
                    const token = jwt.sign(
                        { id, name, email, phone, role },
                        `${process.env.JWT_SECRET_KEY}`,
                    );

                    const response = new Response(
                        true,
                        200,
                        "Account updated successfully.",
                        { ...user.dataValues, token }
                    );
                    return res.status(response.code).json(response);
                }

                //  If Not, then update.
                const updatedUser = await Users.update({ ...value, isVerified: false }, { where: { id } });
                if (updatedUser[0] === 0) {
                    const response = new Response(
                        false,
                        400,
                        "Failed to update user."
                    );
                    return res.status(response.code).json(response);
                }


                //  Get the user back.
                const user = await Users.findOne({
                    where: { id },
                    attributes: {
                        exclude: ["password", "pictureId"]
                    }
                });
                const { name, email, phone, role } = user;

                
                // Create a new TOTP object.
                const totp = new OTPAuth.TOTP({
                    issuer: 'superpunter.com',
                    label: 'SuperPunter',
                    algorithm: 'SHA1',
                    digits: 6,
                    period: 900,
                    secret: `${process.env.OTP_SECRET_KEY}`
                });

                // Generate a Six diigits token.
                const generatedOTP = totp.generate();

                //  Save OTP to the DB
                await OTP.create({
                    userEmail: email,
                    otp: generatedOTP
                });
                // console.log("GEN OTP::: ", generatedOTP);

            
                //  Send OTP to users mail.
                await SendOTPMail.sendMail(name, email, generatedOTP);
                // const emailResponse = await SendOTPMail.sendMail(name, email, generatedOTP);
                // console.log("EMAIL RESPONSE::: ", emailResponse);


                //  Create a Token that will be passed to the response.
                const token = jwt.sign(
                    { id, name, email, phone, role },
                    `${process.env.JWT_SECRET_KEY}`,
                );

                const response = new Response(
                    true,
                    200,
                    "Successfully updated. Kindly check your email for your OTP verification.",
                    { ...user.dataValues, token }
                );
                return res.status(response.code).json(response);
            }

        } catch (error) {
            console.log(`ERROR::: ${error}`);

            const response = new Response(
                false,
                500,
                'Server error, please try again later.'
            );
            return res.status(response.code).json(response);
        }
    };

    //  Delete a User.
    static deleteUser = async (req, res) => {
        try {
            const { id } = req.params;

            /**
             * Before deleting a user, first chack if the user already had a picture uploaded 
             * on Cloudinary and first remove it.
             * */
             const { pictureId } = await Users.findOne({ where: { id } });
             if (pictureId) {
                // Delete image from Cloudinary.
                await cloudinary.uploader.destroy(pictureId);
             }

            const isDeleted = await Users.destroy({
                where: { id }
            });
            if (isDeleted !== 1) {
                const response = new Response(
                    false,
                    404,
                    "No user found."
                );
                return res.status(response.code).json(response);
            }

            const response = new Response(
                true,
                200,
                "User deleted successfully."
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
    };

    //  Delete a Punter.
    static deletePunter = async (req, res) => {
        try {
            const { id } = req.params;

            /**
             * Before deleting a user, first chack if the user already had a picture uploaded 
             * on Cloudinary and first remove it.
             * */
             const { pictureId } = await Users.findOne({ where: { id } });
             if (pictureId) {
                // Delete image from Cloudinary.
                await cloudinary.uploader.destroy(pictureId);
             }

            const isDeleted = await Users.destroy({
                where: { id, role: "Punter" }
            });
            if (isDeleted !== 1) {
                const response = new Response(
                    false,
                    404,
                    "No user found."
                );
                return res.status(response.code).json(response);
            }


            //  Get All the Punters again.
            const punters = await Users.findAll({
                where: {role: "Punter"},
                attributes: {
                    exclude: ["password", "pictureId"]
                }
            });            
            if (punters.length === 0) {
                const response = new Response(
                    false,
                    404,
                    "No punter found."
                );
                return res.status(response.code).json(response);
            }

            const response = new Response(
                true,
                200,
                'Punters retrieved successfully.',
                punters
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
    };

    //  Delete an Audience.
    static deleteAudience = async (req, res) => {
        try {
            const { id } = req.params;
            console.log(id);

            /**
             * Before deleting a user, first chack if the user already had a picture uploaded 
             * on Cloudinary and first remove it.
             * */
             const { pictureId } = await Users.findOne({ where: { id } });
             if (pictureId) {
                // Delete image from Cloudinary.
                await cloudinary.uploader.destroy(pictureId);
             }

            const isDeleted = await Users.destroy({
                where: { id, role: "Audience" }
            });
            if (isDeleted !== 1) {
                const response = new Response(
                    false,
                    404,
                    "No user found."
                );
                return res.status(response.code).json(response);
            }

            //  Get All the Punters again.
            const audience = await Users.findAll({
                where: {role: "Audience"},
                attributes: {
                    exclude: ["password", "pictureId"]
                }
            });
            if (!audience.length) {
                const response = new Response(
                    false,
                    404,
                    "No audience found."
                );
                return res.status(response.code).json(response);
            }

            const response = new Response(
                true,
                200,
                'Audience retrieved successfully.',
                audience
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
    };

    //  Upload Users Profile Picture.
    static uploadUserProfilePicture = async (req, res) => {
        try {
            const { id } = req.requestPayload;

            /**
             * To update user picture, first chack if the user already had a picture uploaded 
             * on Cloudinary and first remove it.
             * 
             * Please NOTE::: If the "public_id" below is static, automatically, the image will
             * be replaced without being duplicated. So it's either you make the "public_id" to
             * be static for each user or you delete before reuploading.
             * */
            //  const { pictureId } = await Users.findOne({ where: { id } });
            //  if (pictureId) {
            //     // Delete image from Cloudinary.
            //     await cloudinary.uploader.destroy(pictureId);
            //  }

            // Upload image to cloudinary
            const { url: profilePictureURL, public_id: avatarId } = await cloudinary.uploader.upload(req.file.path, {
                public_id: `${ id }_profile_photo`,
                folder: 'assets/images/profile_pictures',
                quality_analysis: true,
                width: 500,
                height: 500,
                crop: 'fill',
            });

            //  Update the Users Profile Picture..
            const updatedUser = await Users.update(
                { picture: profilePictureURL, pictureId: avatarId },
                { where: { id } }
            );
            if (updatedUser[0] === 0) {
                const response = new Response(
                    false,
                    400,
                    "Failed to update profile picture."
                );
                return res.status(response.code).json(response);
            }

            //  Get the user back.
            const user = await Users.findOne({
                where: { id },
                attributes: {
                    exclude: ["password", "pictureId"]
                }
            });
            const { name, email, phone, role } = user;


            //  Create a Token that will be passed to the response.
            const token = jwt.sign(
                { id, name, email, phone, role },
                `${process.env.JWT_SECRET_KEY}`,
            );

            //  Now remove the "password" before returning the User.
            const userDataValues = user.dataValues;
            delete userDataValues.password;

            const response = new Response(
                true,
                200,
                'Successfully created a doctor.',
                { ...userDataValues, token }
            );
            return res.status(response.code).json(response);

        } catch (error) {
            console.log(`ERROR::: ${error.message}`);

            const response = new Response(
                false,
                504,
                'Server error, please try again later.'
            );
            return res.status(response.code).json(response);
        }
    };
};

export default UsersController;