import { APIError, APIResponseCodes, Limits, PaginatedAPIData, generateId } from "@twit2/std-library";
import { FeedAlgorithm } from './feed/FeedAlgorithm';
import { PostsStore } from "./PostsStore";
import { PostInsertOp } from "./op/PostInsertOp";
import { EnhancedPost, Post } from "./types/Post";
import { RPCClient } from "@twit2/std-library/dist/comm/rpc/RPCClient";
import { PostRetrieveOp } from "./op/PostRetrieveOp";
import { PostDeleteOp } from "./op/PostDeleteOp";
import { PostEditOp } from "./op/PostUpdateOp";
import { ReplyRetrieveOp } from "./op/ReplyRetrieveOp";
import { GenericPagedOp } from "@twit2/std-library";
import Ajv from "ajv";

let authRPC : RPCClient;

const ajv = new Ajv();
const PAGE_SIZE = 10;

const createPostSchema = {
    type: "object",
    properties: {
        textContent: { type: "string", minLength: Limits.posts.tcontent.min, maxLength: Limits.posts.tcontent.max },
        replyToId: { type: ["string"] },
        authorId: { type: ["string"] }
    },
    required: ["textContent"],
    additionalProperties: false
};

const updatePostSchema = {
    type: "object",
    properties: {
        textContent: { type: "string", minLength: Limits.posts.tcontent.min, maxLength: Limits.posts.tcontent.max },
        id: { type: ["string"] },
        authorId: { type: ["string"] }
    },
    required: ["textContent", "id", "authorId"],
    additionalProperties: false
};

const getPostSchema = {
    type: "object",
    properties: {
        page: { type: "number" },
        userId: { type: "string", minLength: Limits.general.hard.min, maxLength:Limits.general.hard.max }
    },
    required: ["page", "userId"],
    additionalProperties: false
};

const getLatestPostSchema = {
    type: "object",
    properties: {
        page: { type: "number" }
    },
    required: ["page"],
    additionalProperties: false
}

const getRepliesSchema = {
    type: "object",
    properties: {
        page: { type: "number" },
        postId: { type: "string", minLength: Limits.general.hard.min, maxLength:Limits.general.hard.max }
    },
    required: ["page", "postId"],
    additionalProperties: false
};

/**
 * Prepares the RPC client.
 */
/* istanbul ignore next */
export async function prepareRPC(rpcc: RPCClient) {
    authRPC = rpcc;
}

/**
 * Creates a new post.
 * @param op The insertion operation parameters.
 */
async function createPost(op: PostInsertOp): Promise<EnhancedPost> {
    // Validate the schema to ensure data is correct
    if(!ajv.validate(createPostSchema, op))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    // Construct the post
    const post : EnhancedPost = {
        authorId: op.authorId,
        textContent: op.textContent,
        replyToId: op.replyToId,
        datePosted: new Date(),
        id: generateId({ workerId: process.pid, procId: process.ppid }),
        stats: {
            likes: 0,
            replies: 0
        }
    };

    // Check if this is a comment
    if(op.replyToId !== undefined) {
        if(!(await getPostById(op.replyToId))) // Target post must exist
            throw APIError.fromCode(APIResponseCodes.NOT_FOUND);
    }

    await PostsStore.createPost(post);
    return post;
}

/**
 * Gets posts.
 * @param op The operation params.
 */
async function getPosts(op: PostRetrieveOp): Promise<PaginatedAPIData<EnhancedPost>> {
    // Validate the schema to ensure data is correct
    if(!ajv.validate(getPostSchema, op))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    const eps : EnhancedPost[] = [];

    for(let post of await PostsStore.getPosts(op.page, PAGE_SIZE, op.userId))
        eps.push(await enhancePost(post));

    return {
        currentPage: -1,
        pageSize: PAGE_SIZE,
        data: eps
    };
}

/**
 * Gets the latest posts.
 * @param op The operation params.
 */
async function getLatestPosts(op: GenericPagedOp): Promise<PaginatedAPIData<EnhancedPost>> {
    // Validate the schema to ensure data is correct
    if(!ajv.validate(getLatestPostSchema, op))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    const eps : EnhancedPost[] = [];

    for(let post of await PostsStore.getLatestPosts(op.page, PAGE_SIZE))
        eps.push(await enhancePost(post));

    return {
        currentPage: -1,
        pageSize: PAGE_SIZE,
        data: eps
    };
}

/**
 * Gets replies.
 * @param op The operation params.
 */
async function getReplies(op: ReplyRetrieveOp): Promise<PaginatedAPIData<EnhancedPost>> {
    // Validate the schema to ensure data is correct
    if(!ajv.validate(getRepliesSchema, op))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    const eps : EnhancedPost[] = [];

    for(let post of await PostsStore.getReplies(op.page, PAGE_SIZE, op.postId))
        eps.push(await enhancePost(post));

    return {
        currentPage: -1,
        pageSize: PAGE_SIZE,
        data: eps
    };
}

/**
 * Gets a post by ID.
 * @param id The ID of the post to get.
 */
async function getPostById(id: string) {
    return await PostsStore.findPostById(id);
}

/**
 * Gets an enhanced post.
 * @param id The ID of the post to get.
 */
async function getEnhancedPost(id: string) {
    const p = await getPostById(id);

    if(!p)
        throw APIError.fromCode(APIResponseCodes.NOT_FOUND);

    return await enhancePost(p);
}

/**
 * Deletes a post.
 * @param id The operation.
 */
async function deletePost(op: PostDeleteOp) {
    const post = await getPostById(op.id);

    if(!post)
        throw APIError.fromCode(APIResponseCodes.NOT_FOUND);

    // Check if post belongs to user
    if(post.authorId !== op.authorId)
        throw APIError.fromCode(APIResponseCodes.ACCESS_DENIED);

    // We are dealing with a comment
    if(post.replyToId != null) {
        // TODO check if post is part of a comment thread
        // This is important because we must reattach the broken parts after comment removal.
        throw new Error('Not implemented.');
    }

    await PostsStore.deletePost(op.id);
}

/**
 * Edits a post.
 * @param op The operation.
 */
async function editPost(op: PostEditOp): Promise<EnhancedPost> {
    const post = await getPostById(op.id);

    if(!post)
        throw APIError.fromCode(APIResponseCodes.NOT_FOUND);

    // Check if post belongs to user
    if(post.authorId !== op.authorId)
        throw APIError.fromCode(APIResponseCodes.ACCESS_DENIED);

    if(!ajv.validate(updatePostSchema, op))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    return enhancePost(await PostsStore.editPost(op.id, op.textContent));
}

/**
 * Enhances a post.
 * @param p The post to enhance.
 */
async function enhancePost(p: Post) : Promise<EnhancedPost> {
    if(!p)
        throw new Error("Cannot enhance null post.");

    return {
        ...p,
        ...{
            stats: {
                likes: 0,
                replies: await PostsStore.getReplyCount(p.id) ?? 0
            }
        }
    };
}

/**
 * Gets the user's feed.
 * @param op DTO for feed.
 */
async function getFeed(op: PostRetrieveOp) {
    return await FeedAlgorithm.computePage(op.userId, op.page);
}

export const PostsMgr = {
    prepareRPC,
    createPost,
    deletePost,
    getPosts,
    getFeed,
    getLatestPosts,
    getReplies,
    editPost,
    getPostById,
    enhancePost,
    getEnhancedPost
}