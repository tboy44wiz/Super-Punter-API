'use strict';

import Sequelize from "sequelize";
import models from "../database/models";
import Response from "../utils/response";
import JoiValidator from "../utils/joi_validator";

const { Likes, Views, Podcasts } = models;


class LikeController {

    //  Create or Delete a Podcast Like.
    static createOrDeleteLike = async (req, res) => {
        try {
            const requestBody = req.body;
            // console.log("REQUES BODY::: ", requestBody);
            
            //  Validate the Request Body.
            const { error, value } = JoiValidator.likesSchema.validate(requestBody);
            if (error) {
                const response = new Response(
                    false,
                    400,
                    `${error.message}`
                );
                return res.status(response.code).json(response);
            }

            //  Create a Like.
            const [like, created] = await Likes.findOrCreate({
                where: { podcastId: value.podcastId, userId: value.userId },
                defaults: { ...value }
            });
           
            //  If Not created, delete already existing one.
            if (!created) {

                //  Delete Like.
                const isDeleted = await Likes.destroy({ where: { podcastId: value.podcastId, userId: value.userId } });

                //  Get the disliked Podcast count.
                const podcast = await Podcasts.findOne({
                    where: { id: value.podcastId },
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
                    201,
                    'Podcast disliked successfully.',
                    podcast
                );
                return res.status(response.code).json(response);
            }

            
            //  Get the liked Podcast count.
            const podcast = await Podcasts.findOne({
                where: { id: value.podcastId },
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
                201,
                'Podcast liked successfully.',
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
}


export default LikeController;