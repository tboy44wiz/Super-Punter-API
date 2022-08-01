'use strict';

import { Router } from "express";
import PodcastsController from "../controllers/podcast_controller";
import TokenVerification from "../utils/token_verification";
import { featuredImageUpload, featuredVideoUpload, featuredImageAndVideoUpload } from "../utils/cloudinary_file_upload";

//  Set up Express Router.
const podcastRouter = Router();

//  Create Podcast.
podcastRouter.post(
    "/create_podcast",
    TokenVerification.adminTokenVerification,
    featuredImageAndVideoUpload,
    PodcastsController.createPodcast,
);

//  Get all Podcasts.
podcastRouter.get(
    "/get_all_podcasts",
    PodcastsController.getAllPodcasts,
);

//  Get a single Podcast.
podcastRouter.get(
    "/get_single_podcast/:id",
    PodcastsController.getSinglePodcast,
);

//  Update a Podcast.
podcastRouter.put(
    "/update_single_podcast/:id",
    TokenVerification.adminTokenVerification,
    featuredImageAndVideoUpload,
    PodcastsController.updateSinglePodcast,
);

//  Delete a Podcast.
podcastRouter.delete(
    "/delete_single_podcast/:id",
    TokenVerification.adminTokenVerification,
    PodcastsController.deleteSinglePodcast,
);

//  Upload Podcast Featured Image.
podcastRouter.post(
    "/upload_podcast_image",
    TokenVerification.adminTokenVerification,
    featuredImageUpload,
    PodcastsController.uploadPodcastFeaturedImage
);

//  Upload Podcast Featured Video.
podcastRouter.post(
    "/upload_podcast_video",
    TokenVerification.adminTokenVerification,
    featuredVideoUpload,
    PodcastsController.uploadPodcastFeaturedVideo
);

//  Uploading Podcast Video.

export default podcastRouter;