import { configDotenv } from 'dotenv';
import express from 'express';
import { ErrorHandlingMiddleware, SessionVerifierMiddleware } from '@twit2/std-library';
import { PostsWorker } from './PostsWorker';
import { PostsStore } from './PostsStore';
import { handleCreatePost } from './routes/CreatePost';
import { handleGetPosts } from './routes/GetPosts';

// Load ENV parameters
configDotenv();

// Setup
// ------------------------------------------------
const app = express();
const port = process.env.HTTP_PORT || 3201;

app.use(express.json());

// Use session verifier
app.use(SessionVerifierMiddleware.handle);

// Routes
// ------------------------------------------------
app.post('/', handleCreatePost);
app.get('/', handleGetPosts);
app.get('/:user/:page', handleGetPosts);

app.use(ErrorHandlingMiddleware.handle);

/**
 * Main entry point for program.
 */
async function main() {
    await PostsStore.init();
    await PostsWorker.init(process.env.MQ_URL as string);

    // Listen at the port
    app.listen(port, () => {
        console.log(`Posts service active at port ${port}`);
    });
}

main();