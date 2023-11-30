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
 * Deletes a post.
 * @param id The id of the post to delete.
 */
async function deletePost(id: string) {
    return await PostModel.find({ id }).deleteOne();
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
    return await PostModel.find({ authorId: userId, replyToId: undefined }).sort({ datePosted: -1 }).skip(page * limit).limit(limit);
}

/**
 * Get latest posts.
 */
async function getLatestPosts(page: number, limit: number) {
    return await PostModel.find({ replyToId: undefined }).sort({ datePosted: -1 }).skip(page * limit).limit(limit);
}

/**
 * Gets comments.
 */
async function getReplies(page: number, limit: number, postId: string) {
    return await PostModel.find({ replyToId: postId }).sort({ datePosted: -1 }).skip(page * limit).limit(limit);
}

/**
 * Edits the text content of the post.
 * @param id The ID of the post to edit
 * @param textContent The new content to place.
 */
async function editPost(id: string, textContent: string) {
    const post = await PostModel.findOne({ id });
    
    if(!post)
        throw new Error("Post does not exist.");

    post.textContent = textContent;
    post.dateEdited = new Date();
    
    await post.save();
    return post.toJSON();
}

export const PostsStore = {
    getPosts,
    getLatestPosts,
    init,
    createPost,
    deletePost,
    editPost,
    getReplies,
    findPostById
}