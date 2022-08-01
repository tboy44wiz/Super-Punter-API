'use strict';

import { Router } from 'express';
import UsersController from "../controllers/user_controller";
import TokenVerification from "../utils/token_verification";
import { userProfilePictureUpload } from "../utils/cloudinary_file_upload"

//  Set up Express Router.
const userRouter = Router();

//  Users Signup.
userRouter.post(
    "/signup",
    UsersController.signupUser
);

//  User Login.
userRouter.post(
    "/login",
    UsersController.loginUser
);

//  Get all Users.
userRouter.get(
    "/all_users",
    TokenVerification.userTokenValidation,
    UsersController.getAllUsers
);

//  Get all Audience.
userRouter.get(
    "/all_audience",
    TokenVerification.userTokenValidation,
    UsersController.getAllAudience
);

//  Get all Punters.
userRouter.get(
    "/all_punters",
    TokenVerification.userTokenValidation,
    UsersController.getAllPunters
);

//  Get a single User.
userRouter.get(
    "/single_user/:id",
    TokenVerification.userTokenValidation,
    UsersController.getSingleUser
);

//  Update a User.
userRouter.put(
    "/update_user/:id",
    TokenVerification.userTokenValidation,
    UsersController.updateUser
);

//  Delete User.
userRouter.delete(
    "/delete_user/:id",
    TokenVerification.userTokenValidation,
    UsersController.deleteUser
);

//  Delete a Punter.
userRouter.delete(
    "/delete_punter/:id",
    TokenVerification.userTokenValidation,
    UsersController.deletePunter
);

//  Delete a Audience.
userRouter.delete(
    "/delete_audience/:id",
    TokenVerification.userTokenValidation,
    UsersController.deleteAudience
);

//  Uploading Users Profile Picture.
userRouter.post(
    "/upload_user_picture",
    TokenVerification.userTokenValidation,
    userProfilePictureUpload,
    UsersController.uploadUserProfilePicture
);
//  https://res.cloudinary.com/dlzcrzwvg/image/upload/v1653509215/dev/assets/images/profile_pictures/lfysd4ftwh8cfdra64r3.jpg

export default userRouter;