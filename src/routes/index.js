'use strict';

import { Router } from 'express';

//  Import all the required routes.
import userRouter from "./user_routes";
import otpRouter from "./otp_routes";
import podcastRouter from "./podcast_routes";
import likeRouter from "./like_routes";
import viewRouter from "./view_routes";



//  Initialize Express Router.
const router = Router();

router.use('/users', userRouter);
router.use('/otp', otpRouter);
router.use('/podcasts', podcastRouter);
router.use('/likes', likeRouter);
router.use('/views', viewRouter);

export default router;
