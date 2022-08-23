'use strict';

import Sequelize from "sequelize";
import models from "../database/models";
import Response from "../utils/response";
import JoiValidator from "../utils/joi_validator";
import cloudinary from "../config/cloudinaryConfig";

const { Podcasts, Likes, Views } = models;

class PodcastsController {

    //  Create Podcast.
    static createPodcast = async (req, res) => {
        try {
            const requestBody = req.body;
            const requestFile = req.files;
            const imageFile = requestFile.featuredImageFile[0];
            const videoFile = requestFile.featuredVideoFile[0];

            // console.log("REQUEST BODY::: ", requestBody);
            console.log("IMAGE FILE::: ", imageFile);
            console.log("VIDEO FILE::: ", videoFile);

            //  Validate the Request Body.
            const { error, value } = JoiValidator.podcastsSchema.validate(requestBody);
            if (error) {
                const response = new Response(
                    false,
                    400,
                    `${error.message}`
                );
                return res.status(response.code).json(response);
            }

            //  Create a new Podcasts.
            const podcast = await Podcasts.create({  ...value });
            if (!podcast) {
                const response = new Response(
                    false,
                    409,
                    "Podcast creation failed."
                );
                return res.status(response.code).json(response);
            }
            const { id } = podcast;

            
            // At this point, Upload image to cloudinary
            const { secure_url: featuredImageFile, public_id: featuredImageId } = await cloudinary.uploader.upload(
                imageFile.path, 
                {
                    public_id: `${ id }_featured_image`,
                    folder: 'assets/images/podcast_images',
                    quality_analysis: true,
                    width: 1024,
                    height: 500,
                    crop: 'fill',
                    timeout: 20000,
                }
            );
            console.log(`DDDD::: , ${featuredImageFile}`); 

            // Next, Upload video to cloudinary
            const { secure_url: featuredVideoFile, public_id: featuredVideoId } = await cloudinary.uploader.upload_large(
                videoFile.path, 
                {
                    public_id: `${ id }_featured_video`,
                    folder: 'assets/videos/podcast_videos',
                    quality_analysis: true,
                    resource_type: 'video',
                    chunk_size: 6000000,
                    eager: [
                        {
                            width: 1024,
                            height: 576,
                            crop: "fill",
                            audio_codec: "none",
                        },
                    ],
                    timeout: 100000,
                }
            );
            console.log(`DDDD::: , ${featuredVideoFile}`); 

            //  Finally update the Podcast Video and Featured Image.
            const updatedPodcast = await Podcasts.update(
                { featuredImageFile, featuredImageId, featuredVideoFile, featuredVideoId },
                { where: { id } }
            );
            if (updatedPodcast[0] === 0) {
                const response = new Response(
                    false,
                    400,
                    "Failed to update podcast video and featured image ."
                );
                return res.status(response.code).json(response);
            }

            //  Get the Podcast back.
            const returnedPodcast = await Podcasts.findOne({
                where: { id },
                attributes: { 
                    include: [
                        [Sequelize.fn("COUNT", Sequelize.col("likes.id")), "likesCount"],
                    ] 
                },
                include: [{
                    model: Likes,
                    as: "likes",
                    attributes: []
                }],
                group: ["Podcasts.id"]
            });

            const response = new Response(
                true,
                201,
                "Podcast created successfully.",
                { podcast: returnedPodcast }
            );
            return res.status(response.code).json(response);

        } catch (error) {
            console.log(`ERROR::: `, error);

            const response = new Response(
                false,
                500,
                'Server error, please try again later.'
            );
            return res.status(response.code).json(response);
        }
    };
    
    // Upload Podcast Featured Image.
    static uploadPodcastFeaturedImage = async (req, res) => {
        try {
            const { id } = req.body;
            const requestFile = req.files;

            // console.log("IMAGE FILE::: ", imageFile);
            
            /**
             * To update user picture, first check if the user already had a picture uploaded 
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
            const { url: featuredImageFile } = await cloudinary.uploader.upload(requestFile.path, {
                public_id: `${ id }_featured_image`,
                folder: 'assets/images/podcast_images',
                quality_analysis: true,
                width: 1024,
                height: 500,
                crop: 'fill',
            });

            //  Update the Podcast Featured Image.
            const updatedPodcast = await Podcasts.update(
                { featuredImageFile },
                { where: { id } }
            );
            if (updatedPodcast[0] === 0) {
                const response = new Response(
                    false,
                    400,
                    "Failed to update podcast featured image."
                );
                return res.status(response.code).json(response);
            }

            //  Get the Podcast back.
            const podcast = await Podcasts.findOne({
                where: { id },
                attributes: { 
                    include: [
                        [Sequelize.literal("COUNT(DISTINCT(likes.id))"), "likesCount"],
                        [Sequelize.literal("COUNT(DISTINCT(views.id))"), "viewsCount"],
                    ] 
                },
                include: [
                    {
                        model: Likes,
                        as: "likes",
                        attributes: [],
                    },
                    {
                        model: Views,
                        as: "views",
                        attributes: []
                    }
                ],
                group: ["Podcasts.id"]
            });

            //  Get the Podcast's "likes.userId".
            const likes = await Likes.findAll({
                where: { podcastId: podcast.id },
                attributes: ["userId"]
            });
            podcast.dataValues.likes = likes;

            const response = new Response(
                true,
                200,
                'Successfully uploaded podcast featured image.',
                podcast
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
    
    // Upload Podcast Featured Video.
    static uploadPodcastFeaturedVideo = async (req, res) => {
        try {
            const { id } = req.body;
            const requestFile = req.files;
            
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

            // Upload video to cloudinary.
            const { url: featuredVideoFile } = await cloudinary.uploader.upload(requestFile.path, {
                public_id: `${ id }_featured_video`,
                folder: 'assets/videos/podcast_videos',
                quality_analysis: true,
                resource_type: 'video',
                chunk_size: 6000000,
                eager: [
                    {
                        width: 1024,
                        height: 576,
                        crop: "fill",
                        audio_codec: "none",
                    }
                ],
            });

            //  Update the Podcast Featured Video.
            const updatedPodcast = await Podcasts.update(
                { featuredVideoFile },
                { where: { id } }
            );
            if (updatedPodcast[0] === 0) {
                const response = new Response(
                    false,
                    400,
                    "Failed to update podcast featured video."
                );
                return res.status(response.code).json(response);
            }

            //  Get the Podcast back.
            const podcast = await Podcasts.findOne({
                where: { id },
                attributes: { 
                    include: [
                        [Sequelize.literal("COUNT(DISTINCT(likes.id))"), "likesCount"],
                        [Sequelize.literal("COUNT(DISTINCT(views.id))"), "viewsCount"],
                    ] 
                },
                include: [
                    {
                        model: Likes,
                        as: "likes",
                        attributes: [],
                    },
                    {
                        model: Views,
                        as: "views",
                        attributes: []
                    }
                ],
                group: ["Podcasts.id"]
            });

            //  Get the Podcast's "likes.userId".
            const likes = await Likes.findAll({
                where: { podcastId: podcast.id },
                attributes: ["userId"]
            });
            podcast.dataValues.likes = likes;


            const response = new Response(
                true,
                200,
                'Successfully uploaded podcast featured image.',
                podcast
            );
            return res.status(response.code).json(response);
            
        } catch (error) {
            console.log(error);

            const response = new Response(
                false,
                500,
                'Server error, please try again later.'
            );
            return res.status(response.code).json(response);
        }
    }

    //  Get all Podcasts.
    static getAllPodcasts = async (req, res) => {
        try {
            
            const podcasts = await Podcasts.findAll({
                attributes: { 
                    include: [
                        [Sequelize.literal("COUNT(DISTINCT(likes.id))"), "likesCount"],
                        [Sequelize.literal("COUNT(DISTINCT(views.id))"), "viewsCount"],
                    ] 
                },
                include: [
                    {
                        model: Likes,
                        as: "likes",
                        attributes: [],
                    },
                    {
                        model: Views,
                        as: "views",
                        attributes: []
                    }
                ],
                group: ["Podcasts.id"]
            });
            if (!podcasts.length) {
                const response = new Response(
                    false,
                    404,
                    "No podcast found."
                );
                return res.status(response.code).json(response);
            }

            // Loop through all the "podcasts" and get their corresponding "likes.userId".
            for (const podcast of podcasts) {
                const likes = await Likes.findAll({
                    where: { podcastId: podcast.id },
                    attributes: ["userId"]
                });

                podcast.dataValues.likes = likes;
            }

            const response = new Response(
                true,
                200,
                'Podcasts retrieved successfully.',
                podcasts 
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

    //  Get a single Podcast.
    static getSinglePodcast = async (req, res) => {
        try {
            const { id } = req.params;

            const podcast = await Podcasts.findOne({
                where: { id },
                attributes: { 
                    include: [
                        [Sequelize.literal("COUNT(DISTINCT(likes.id))"), "likesCount"],
                        [Sequelize.literal("COUNT(DISTINCT(views.id))"), "viewsCount"],
                    ] 
                },
                include: [
                    {
                        model: Likes,
                        as: "likes",
                        attributes: [],
                    },
                    {
                        model: Views,
                        as: "views",
                        attributes: []
                    }
                ],
                group: ["Podcasts.id"]
            });
            if (!podcast) {
                const response = new Response(
                    false,
                    404,
                    "Podcast does not exist."
                );
                return res.status(response.code).json(response);
            }

            //  Get the Podcast's "likes.userId".
            const likes = await Likes.findAll({
                where: { podcastId: podcast.id },
                attributes: ["userId"]
            });
            podcast.dataValues.likes = likes;

            const response = new Response(
                true,
                200,
                'Podcast retrieved successfully.',
                podcast
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

    //  Update a Podcast.
    static updateSinglePodcast = async (req, res) => {
        try {
            const { id } = req.params;
            const requestBody = req.body;
            const requestFile = req.files;
            const imageFile = (requestFile.featuredImageFile !== undefined) && requestFile.featuredImageFile[0];
            const videoFile = (requestFile.featuredVideoFile !== undefined) && requestFile.featuredVideoFile[0];

            // console.log("REQUEST BODY::: ", requestBody);
            // console.log("IMAGE FILE::: ", imageFile);
            // console.log("VIDEO FILE::: ", videoFile);

            //  Validate the Request Body.
            delete requestBody.featuredVideoFile;   //  Delete "featuredVideoFile" before validating.
            delete requestBody.featuredImageFile;   //  Delete "featuredImageFile" before validating.
            const { error, value } = JoiValidator.podcastsUpdateSchema.validate(requestBody);
            if (error) {
                const response = new Response(
                    false,
                    406,
                    `${error.message}`
                );
                return res.status(response.code).json(response);
            }

            //  Update.
            const updatedPodcast = await Podcasts.update({ ...value }, { where: { id } });
            if (updatedPodcast[0] === 0) {
                const response = new Response(
                    false,
                    400,
                    "Failed to update podcast."
                );
                return res.status(response.code).json(response);
            }

            
            if (imageFile) {
                // At this point, Upload image to cloudinary
                const { url: featuredImageFile, public_id: featuredImageId } = await cloudinary.uploader.upload(imageFile.path, {
                    public_id: `${ id }_featured_image`,
                    folder: 'assets/images/podcast_images',
                    quality_analysis: true,
                    width: 1024,
                    height: 500,
                    crop: 'fill',
                });
                // console.log("DDDD::: ", featuredImageFile); 

                await Podcasts.update(
                    { featuredImageFile, featuredImageId, },
                    { where: { id } }
                );
            }
            if (videoFile) {
                // Next, Upload video to cloudinary
                const { url: featuredVideoFile, public_id: featuredVideoId } = await cloudinary.uploader.upload(videoFile.path, {
                    public_id: `${ id }_featured_video`,
                    folder: 'assets/videos/podcast_videos',
                    quality_analysis: true,
                    resource_type: 'video',
                    chunk_size: 6000000,
                    eager: [
                        {
                            width: 1024,
                            height: 576,
                            crop: "fill",
                            audio_codec: "none",
                        },
                    ],
                });
                
                await Podcasts.update(
                    { featuredVideoFile, featuredVideoId },
                    { where: { id } }
                );
            }

            //  Get the podcast back.
            const podcast = await Podcasts.findOne({
                where: { id },
                attributes: { 
                    include: [
                        [Sequelize.literal("COUNT(DISTINCT(likes.id))"), "likesCount"],
                        [Sequelize.literal("COUNT(DISTINCT(views.id))"), "viewsCount"],
                    ] 
                },
                include: [
                    {
                        model: Likes,
                        as: "likes",
                        attributes: [],
                    },
                    {
                        model: Views,
                        as: "views",
                        attributes: []
                    }
                ],
                group: ["Podcasts.id"]
            });


            //  Get the Podcast's "likes.userId".
            const likes = await Likes.findAll({
                where: { podcastId: podcast.id },
                attributes: ["userId"]
            });
            podcast.dataValues.likes = likes;

            const response = new Response(
                true,
                200,
                "Podcast updated successfully.",
                podcast
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

    //  Delete a Podcast.
    static deleteSinglePodcast = async (req, res) => {
        try {
            const { id } = req.params;
            // console.log("IDDDD::: ", id);

            /**
             * Before deleting a podcast, first delete its associated video and pictures uploaded 
             * on Cloudinary.
             * */
             const { featuredVideoId, featuredImageId } = await Podcasts.findOne({ where: { id } });
             console.log(featuredVideoId, featuredImageId);
             if (featuredVideoId, featuredImageId) {
                // Delete image from Cloudinary.
                await cloudinary.uploader.destroy(featuredImageId);
                await cloudinary.uploader.destroy(featuredVideoId);
             }
            //  console.log(featuredVideoId, featuredImageId);

            const isDeleted = await Podcasts.destroy({
                where: { id }
            });
            if (isDeleted !== 1) {
                const response = new Response(
                    false,
                    404,
                    "No podcast found."
                );
                return res.status(response.code).json(response);
            }

            //  Get All Podcsts.
            const podcasts = await Podcasts.findAll({
                attributes: { 
                    include: [
                        [Sequelize.literal("COUNT(DISTINCT(likes.id))"), "likesCount"],
                        [Sequelize.literal("COUNT(DISTINCT(views.id))"), "viewsCount"],
                    ] 
                },
                include: [
                    {
                        model: Likes,
                        as: "likes",
                        attributes: [],
                    },
                    {
                        model: Views,
                        as: "views",
                        attributes: []
                    }
                ],
                group: ["Podcasts.id"]
            });
            if (!podcasts.length) {
                const response = new Response(
                    false,
                    404,
                    "No podcast found."
                );
                return res.status(response.code).json(response);
            }

            // Loop through all the "podcasts" and get their corresponding "likes.userId".
            for (const podcast of podcasts) {
                const likes = await Likes.findAll({
                    where: { podcastId: podcast.id },
                    attributes: ["userId"]
                });

                podcast.dataValues.likes = likes;
            }

            const response = new Response(
                true,
                200,
                "Podcast deleted successfully.",
                podcasts
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
}

export default PodcastsController;