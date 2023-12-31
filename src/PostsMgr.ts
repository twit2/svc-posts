import { APIError, APIResponseCodes, Limits, PaginatedAPIData, generateId } from "@twit2/std-library";
import { PostsStore } from "./PostsStore";
import { PostInsertOp } from "./op/PostInsertOp";
import { Post } from "./types/Post";
import { RPCClient } from "@twit2/std-library/dist/comm/rpc/RPCClient";
import { PostRetrieveOp } from "./op/PostRetrieveOp";
import Ajv from "ajv";
import { PostDeleteOp } from "./op/PostDeleteOp";
import { PostEditOp } from "./op/PostUpdateOp";
import { ReplyRetrieveOp } from "./op/ReplyRetrieveOp";
import { GenericPagedOp } from "@twit2/std-library";
import {  WithPostStatistics } from "./types/WithPostStatistics";

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
export async function prepareRPC(rpcc: RPCClient) {
    authRPC = rpcc;
}

/**
 * Creates a new post.
 * @param op The insertion operation parameters.
 */
async function createPost(op: PostInsertOp): Promise<Post> {
    // Validate the schema to ensure data is correct
    if(!ajv.validate(createPostSchema, op))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    // Construct the post
    const post : Post = {
        authorId: op.authorId,
        textContent: op.textContent,
        replyToId: op.replyToId,
        datePosted: new Date(),
        id: generateId({ workerId: process.pid, procId: process.ppid })
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
async function getPosts(op: PostRetrieveOp): Promise<PaginatedAPIData<Post>> {
    // Validate the schema to ensure data is correct
    if(!ajv.validate(getPostSchema, op))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    return {
        currentPage: -1,
        pageSize: PAGE_SIZE,
        data: await PostsStore.getPosts(op.page, PAGE_SIZE, op.userId)
    };
}

/**
 * Gets the latest posts.
 * @param op The operation params.
 */
async function getLatestPosts(op: GenericPagedOp): Promise<PaginatedAPIData<Post>> {
    // Validate the schema to ensure data is correct
    if(!ajv.validate(getLatestPostSchema, op))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    return {
        currentPage: -1,
        pageSize: PAGE_SIZE,
        data: await PostsStore.getLatestPosts(op.page, PAGE_SIZE)
    };
}

/**
 * Gets replies.
 * @param op The operation params.
 */
async function getReplies(op: ReplyRetrieveOp): Promise<PaginatedAPIData<Post>> {
    // Validate the schema to ensure data is correct
    if(!ajv.validate(getRepliesSchema, op))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    return {
        currentPage: -1,
        pageSize: PAGE_SIZE,
        data: await PostsStore.getReplies(op.page, PAGE_SIZE, op.postId)
    };
}

/**
 * Gets a post by ID.
 * @param id The ID of the post to get.
 */
async function getPostById(id: string) {
    return PostsStore.findPostById(id);
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
async function editPost(op: PostEditOp) {
    const post = await getPostById(op.id);

    if(!post)
        throw APIError.fromCode(APIResponseCodes.NOT_FOUND);

    // Check if post belongs to user
    if(post.authorId !== op.authorId)
        throw APIError.fromCode(APIResponseCodes.ACCESS_DENIED);

    if(!ajv.validate(updatePostSchema, op))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    return await PostsStore.editPost(op.id, op.textContent);
}

export const PostsMgr = {
    prepareRPC,
    createPost,
    deletePost,
    getPosts,
    getLatestPosts,
    getReplies,
    editPost,
    getPostById
}