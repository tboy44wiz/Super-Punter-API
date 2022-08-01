'use strict';

import { Router } from "express";
import ViewController from "../controllers/view_controller";
import TokenVerification from "../utils/token_verification";

//  Set up Express Router.
const viewRouter = Router();


//  Create & Delete a Podcast Like.
viewRouter.post(
    "/create_view",
    TokenVerification.userTokenValidation,
    ViewController.createView,
)

export default viewRouter;