'use strict';

import express from 'express';
import dotenv from 'dotenv';

import Response from './utils/response';
import routes from './routes'

dotenv.config();

//  Set Up Express App.
const app = express();

//  parse JSON-encoded bodies and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// To avoid CORS errors, we need to allow some Header accesses as done below
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');

    if (req.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "POST, PUT, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});



//  Create a Default or Root Route.
app.get('/', (req, res) => {
    const response = new Response(
        true,
        200,
        'Welcome to super punter API V1.'
    );
    res.status(response.code).json(response);
});


//  Create other Routes.
app.use('/api/v1', routes);


const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';
const BASE_URL = process.env.BASE_URL || `http://${HOST}:${PORT}`;

app.listen(PORT, () => {
    console.log(`Express server running on port: ${PORT}, Please kindly visit ${BASE_URL}`);
});