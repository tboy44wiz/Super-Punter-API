'use strict';

import Joi from 'joi';

const role = ['Users', 'Admin'];
const status = ['Active', 'Inactive'];
const channel = ['Audio call', 'Video call', 'Physical Visit'];

class JoiValidator {

    /*=====================================================================================*/
    /*=================================== FOR USERS =====================================*/
    //  Users Validation Schema.
    static usersSchema = Joi.object({
        name: Joi.string().required().min(3),
        phone: Joi.string(),
        email: Joi.string().required().email(),
        role: Joi.string().required().valid(...role),
        status: Joi.string().required().valid(...status),
        isVerified: Joi.boolean().required(),
        picture: Joi.string(),
        pictureId: Joi.string(),
        password: Joi.string().required()
            .pattern(new RegExp('^[a-zA-Z0-9]{6,30}$'))
            .error(new Error("Password must be at least 6 characters and alphanumeric.")),
    });

    //  Users Update Validation Schema.
    static usersUpdateSchema = Joi.object({
        name: Joi.string().min(3),
        phone: Joi.string(),
        email: Joi.string().email(),
        role: Joi.string().valid(...role),
        status: Joi.string().valid(...status),
        isVerified: Joi.boolean(),
        picture: Joi.string(),
        pictureId: Joi.string(),
        password: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9]{6,30}$'))
            .error(new Error("Password must be at least 6 characters and alphanumeric."))
    });

    //  User Login Validation Schema.
    static usersLoginSchema = Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required()
    });


    /*=====================================================================================*/
    /*=================================== FOR OTP =====================================*/

    //  OTP Validation Schema.
    static otpSchema = Joi.object({
        name: Joi.string().min(6),
        email: Joi.string().required().email(),
    });

    //  OTP Verification Schema.
    static verifyOTPSchema = Joi.object({
        email: Joi.string().required().email(),
        otp: Joi.string().required(),
    });
    

    /*=====================================================================================*/
    /*=================================== FOR PODCAST =====================================*/
    //  Podcasts Validation Schema.
    static podcastsSchema = Joi.object({
        title: Joi.string().required().min(3),
        contestantA: Joi.string().allow(''),
        contestantB: Joi.string().allow(''),
        sportsName: Joi.string().required().min(3),
        leagueName: Joi.string().required().min(3),
        leagueAbbrev: Joi.string(),
        duration: Joi.string().required(),
        punters: Joi.string().required(),
        // featuredVideoFile: Joi.string(),
        // featuredImageFile: Joi.string(),
    });

    //  Podcasts Update Validation Schema.
    static podcastsUpdateSchema = Joi.object({
        title: Joi.string().required().min(3),
        contestantA: Joi.string().allow(''),
        contestantB: Joi.string().allow(''),
        sportsName: Joi.string().min(3),
        leagueName: Joi.string().min(3),
        leagueAbbrev: Joi.string(),
        duration: Joi.string(),
        punters: Joi.string(),
        // featuredVideoFile: Joi.string(),
        // featuredImageFile: Joi.string(),
    });
    

    /*=====================================================================================*/
    /*=================================== FOR LIKES =====================================*/
    //  Like Validation Schema.
    static likesSchema = Joi.object({
        podcastId: Joi.string().required(),
        userId: Joi.string().required(),
    });
    

    /*=====================================================================================*/
    /*=================================== FOR VIEWS =====================================*/
    //  Like Validation Schema.
    static viewsSchema = Joi.object({
        podcastId: Joi.string().required(),
        userId: Joi.string().required(),
    });
}

export default JoiValidator;
