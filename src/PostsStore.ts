import mongoose from "mongoose";
import { PostModel } from "./models/PostModel";
import { Post } from "./types/Post";

/**
 * Initializes the post store.
 */
async function init() {
    if(process.env.DB_URL == null)
        throw new Error("No database URL defined - is your .env file correct?");

    // Connect to database
    try {
        console.log(`Connecting to ${process.env.DB_URL}...`);
        await mongoose.connect(`${process.env.DB_URL}/${process.env.DB_NAME}`);
        console.log(`Connected to database.`);
    } catch(e) {
        console.error("Cannot connect to database server.");
        return;
    }

    // Init models
    await PostModel.init();
}

/**
 * Creates a post.
 * @param post The post to push.
 */
async function createPost(post: Post) {
    await new PostModel(post).save();
}

/**
 * Finds a post by ID.
 * @param id The id to use.
 */
async function findPostById(id: string): Promise<Post | null> {
    return await PostModel.findOne({ id }).exec();
}

/**
 * Gets posts.
 */
async function getPosts(page: number, limit: number, userId: string) {
    return await PostModel.find({ authorId: userId }).sort({ datePosted: -1 }).skip(page * limit).limit(limit);
}

export const PostsStore = {
    getPosts,
    init,
    createPost,
    findPostById
}