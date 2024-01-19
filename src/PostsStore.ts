import mongoose from "mongoose";
import { PostModel } from "./models/PostModel";
import { Post } from "./types/Post";

/**
 * Initializes the post store.
 */
/* istanbul ignore next */
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
async function createPost(post: Post) : Promise<Post> {
    return (await new PostModel(post).save()).toJSON();
}

/**
 * Deletes a post.
 * @param id The id of the post to delete.
 */
async function deletePost(id: string) {
    await PostModel.find({ id }).deleteOne();
}

/**
 * Finds a post by ID.
 * @param id The id to use.
 */
async function findPostById(id: string): Promise<Post | null> {
    const post = await PostModel.findOne({ id }).exec();

    if(post)
        return post.toJSON();

    return null;
}

/**
 * Gets posts.
 */
async function getPosts(page: number, limit: number, userId: string): Promise<Post[]> {
    return (await PostModel.find({ authorId: userId, replyToId: undefined }).sort({ datePosted: -1 }).skip(page * limit).limit(limit)).map(x => x.toJSON());
}

/**
 * Get latest posts.
 */
async function getLatestPosts(page: number, limit: number): Promise<Post[]> {
    return (await PostModel.find({ replyToId: undefined }).sort({ datePosted: -1 }).skip(page * limit).limit(limit)).map(x => x.toJSON());
}

/**
 * Gets comments.
 */
async function getReplies(page: number, limit: number, postId: string): Promise<Post[]> {
    return (await PostModel.find({ replyToId: postId }).sort({ datePosted: -1 }).skip(page * limit).limit(limit)).map(x => x.toJSON());
}

/**
 * Gets the reply count for the specified post.
 * @param postId The ID of the post to get the count for.
 */
async function getReplyCount(postId: string): Promise<number> {
    return await PostModel.count({ replyToId: postId });
}

/**
 * Edits the text content of the post.
 * @param id The ID of the post to edit
 * @param textContent The new content to place.
 */
async function editPost(id: string, textContent: string): Promise<Post> {
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
    getReplyCount,
    findPostById
}