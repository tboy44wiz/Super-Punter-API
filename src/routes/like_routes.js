'use strict';

import { Router } from "express";
import LikeController from "../controllers/like_controller";
import TokenVerification from "../utils/token_verification";

//  Set up Express Router.
const likeRouter = Router();


//  Create & Delete a Podcast Like.
likeRouter.post(
    "/create_or_delete_podcast_like",
    TokenVerification.userTokenValidation,
    LikeController.createOrDeleteLike,
)

export default likeRouter;