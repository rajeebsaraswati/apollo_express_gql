// dev.ts (or dev.js if using JavaScript)
import app, { httpServer } from "./src/index";

await new Promise<void>((resolve) => {
    try {
        httpServer.listen({ port: 4000 }, resolve);
    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1); // Exit process on failure
    }
});
console.log(`🚀 Server ready at http://localhost:4000/`);

// Handle shutdown gracefully
process.on('SIGINT', () => {
    console.log('🛑 Server shutting down...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('🛑 Server shutting down...');
    process.exit(0);
});