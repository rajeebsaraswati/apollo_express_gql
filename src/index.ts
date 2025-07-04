import * as dotenv from "dotenv";
dotenv.config({
    path: path.join(process.cwd(), '.env')
});
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@as-integrations/express5';
import express from 'express';
import http from 'http';
import cors from 'cors';
import path from "path";
import multer from 'multer';
import sharp from "sharp";
import { v2 as cloudinary } from 'cloudinary';
import typeDefs from './graphql/typeDefs.js';
import resolvers from "./graphql/resolvers.js";
import { decodeJwt } from "./utils.js";
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

export async function initDB() {
    return open({
        filename: path.join(process.cwd(), 'dev.sqlite3'),
        driver: sqlite3.Database,
    });
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface MyContext {
    auth?: Object;
    db: Database;
}

const upload = multer();

const app = express();
app.use('/storage', express.static(path.join(process.cwd(), 'uploads')));

export const httpServer = http.createServer(app);

const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers: resolvers,
    introspection: true,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.get('/', (req: any, res: any) => {
    return res.json({ "message": "Hello World!" })
});

app.post('/upload', upload.single('file'), async (req: any, res: any) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // console.log(req.body.entity);

    const resizeOptions = JSON.parse(req.body.resizeOptions);
    // console.log(resizeOptions)

    const resizeWidth = resizeOptions.width ?? 100;
    const resizeHeight = resizeOptions.height ?? 100;
    // const resizeQuality = req.body.resize.quality ?? 80;

    const targetFilePath = '/tmp/' + req.file.originalname;

    await sharp(req.file.buffer)
        .resize(resizeWidth, resizeHeight)
        .toFile(targetFilePath);

    const result = await cloudinary.uploader
        .upload(targetFilePath);

    // console.log(result);

    res.json({ message: 'File uploaded successfully', url: result.secure_url });
});

app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
        context: async ({ req }) => {
            const authHeader = req.headers.authorization || '';
            const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
            const authInfo = token ? decodeJwt(token) : null;
            const db = await initDB();
            return {
                auth: authInfo,
                db
            }
        },
    }),
);

export default app;