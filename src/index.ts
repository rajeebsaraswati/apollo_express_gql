import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@as-integrations/express5';
import express from 'express';
import http from 'http';
import cors from 'cors';
import path from "path";
import multer from 'multer';
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

interface MyContext {
    auth?: Object;
    db: Database;
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage
});

const app = express();
app.use('/storage', express.static(path.join(process.cwd(), 'uploads')));

export const httpServer = http.createServer(app);

const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers: resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

app.get('/', (req: any, res: any) => {
    return res.json({ "message": "Hello World!" })
});

app.post('/upload', upload.single('file'), (req: any, res: any) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ message: 'File uploaded successfully', filename: req.file.filename });
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

// await new Promise<void>((resolve) => {
//     try {
//         httpServer.listen({ port: 4000 }, resolve);
//     } catch (error) {
//         console.error('❌ Error starting server:', error);
//         process.exit(1); // Exit process on failure
//     }
// });
// console.log(`🚀 Server ready at http://localhost:4000/`);

// // Handle shutdown gracefully
// process.on('SIGINT', () => {
//     console.log('🛑 Server shutting down...');
//     process.exit(0);
// });

// process.on('SIGTERM', () => {
//     console.log('🛑 Server shutting down...');
//     process.exit(0);
// });