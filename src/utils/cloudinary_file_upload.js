'use strict';

import multer from 'multer';
import path from "path";
import Response from './response';


// Multer Storage Method.
const storage = multer.diskStorage({});


// Multer File Filter.
/**
    const imageFilter = (req, file, callback) => {
        //  Get the File Extension name.
        const extName = path.extname(file.originalname).toLowerCase();

        //  Allowed Extensions.
        if (extName === ".jpg" || extName === ".jpeg" || extName === ".png") {
            return callback(null, true);
        }
        return callback({ message: 'Error; Please select JPG, JPEG or PNG images only.' }, false);
    } ;
*/


// Multer File Filter.
/**
    const videoFilter = (req, file, callback) => {
        //  Get the File Extension name.
        const extName = path.extname(file.originalname).toLowerCase();

        //  Allowed Extensions.
        if (extName === ".mp4" || extName === ".avi" || extName === ".mkv") {
            return callback(null, true);
        }
        return callback({ message: 'Error; Please select MP4, AVI or MKV videos only.' }, false);
    } ;
*/





/**
 * For User Profile Picture.
*/
// Multer Object.
const userUpload = multer({ 
    storage: storage,
    limits: {fileSize: 1000 * 1000},
}).single('profilePicture');

//  Uploading User Profile Image Function.
const userProfilePictureUpload = (req, res, next) => {
    userUpload(req, res, (error) => {
        if(error) {
            const response = new Response(
                false,
                400,
                (error.message) ? `Error: ${error.message}` : error
            );
            return res.status(response.code).json(response);
        }
        return next();
    });
}





/**
 * For Podcast Featured Image.
*/
// Multer Object.
const featuredImageUpload = multer({
    storage: storage,
    limits: {fileSize: 1000 * 1000},
}).single('featuredImageFile');





/**
 * For Podcast Featured Video.
*/
// Multer Object.
const featuredVideoUpload = multer({
    storage: storage,
}).single('featuredVideoFile');




/**
 * For Podcast Featured Image and Video.
*/
// Multer Object.
const featuredImageAndVideoUpload = multer({
    storage: storage,
}).fields([
    { name: "featuredImageFile", maxCount: 1 }, 
    { name: "featuredVideoFile", maxCount: 1 }
]);


export { userProfilePictureUpload, featuredImageUpload, featuredVideoUpload, featuredImageAndVideoUpload  };
