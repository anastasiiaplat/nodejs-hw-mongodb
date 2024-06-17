import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import { env } from './utils/env.js';
import rootRouter from './routers/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';

const PORT = Number(env('PORT', '3001'));

export const setupServer = () => {

    const app = express();

    app.use(cors());

    app.use(express.json());

    app.use(pino({
        transport: {
            target: 'pino-pretty',
        },
    })
        ,);

    app.use(cookieParser());

    app.use(rootRouter);

    app.use('*', notFoundHandler);

    app.use(errorHandler);

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

};