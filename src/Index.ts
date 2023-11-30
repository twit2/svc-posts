import { configDotenv } from 'dotenv';
import express from 'express';
import { ErrorHandlingMiddleware, SessionVerifierMiddleware } from '@twit2/std-library';
import { PostsWorker } from './PostsWorker';
import { PostsStore } from './PostsStore';
import { handleCreatePost } from './routes/CreatePost';
import { handleGetPosts } from './routes/GetPosts';
import { handleGetOnePost } from './routes/GetOnePost';
import { handleDeletePost } from './routes/DeletePost';
import { handlePostEdit } from './routes/EditPost';
import { handleGetReplies } from './routes/GetReplies';
import { handleGetLatestPosts } from './routes/GetLatestPosts';
require('express-async-errors');

// Load ENV parameters
configDotenv();

// Setup
// ------------------------------------------------
const app = express();
const port = process.env.HTTP_PORT ?? 3202;

app.use(express.json());

// Use session verifier
app.use(SessionVerifierMiddleware.handle);

// Routes
// ------------------------------------------------
app.get('/latest/:page', handleGetLatestPosts);
app.post('/', handleCreatePost);
app.delete('/:id', handleDeletePost);
app.patch('/:id', handlePostEdit);
app.get('/:id/replies/:page', handleGetReplies);
app.get('/view/:id', handleGetOnePost);
app.get('/:user/:page', handleGetPosts);
app.get('/@me', handleGetPosts);

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