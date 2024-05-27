import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import { env } from './utils/env.js';
import { getAllContacts, getContactById } from './services/contacts.js';


const PORT = Number(env('PORT', '3001'));

export const setupServer = () => {
    const app = express();
    app.use(express.json());
    app.use(cors());

    app.use(
        pino({
            transport: {
                target: 'pino-pretty',
            },
        }),
    );

    app.get('/contacts', async (req, res) => {
        const contacts = await getAllContacts();
        res.status(200).json({
            message: 'Successfully found contacts!',
            data: contacts,
        });
    });

    app.get('/contacts/:contactId', async (req, res) => {
        const contactId = req.params.contactId;
        const contact = await getContactById(contactId);
        if (!contact) {
            return res.status(404).json({
                message: `There is no contact with id ${contactId}`,
            });
        }
        res.status(200).json({
            message: `Successfully found contact with id ${contactId}`,
            data: contact,
        });
    });

    app.use('*', (req, res, next) => {
        res.status(404).json({
            message: 'Not found',
        });
    });

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};