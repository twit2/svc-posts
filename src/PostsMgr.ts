import { APIError, APIResponseCodes, Limits, PaginatedAPIData, generateId } from "@twit2/std-library";
import { PostsStore } from "./PostsStore";
import { PostInsertOp } from "./op/PostInsertOp";
import { Post } from "./types/Post";
import { RPCClient } from "@twit2/std-library/dist/comm/rpc/RPCClient";
import { PostRetrieveOp } from "./op/PostRetrieveOp";
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

const getPostSchema = {
    type: "object",
    properties: {
        page: { type: "number" },
        userId: { type: "string", minLength: Limits.general.hard.min, maxLength:Limits.general.hard.max }
    },
    required: ["page", "userId"],
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
 * Gets a post by ID.
 * @param id The ID of the post to get.
 */
async function getPostById(id: string) {
    return PostsStore.findPostById(id);
}

export const PostsMgr = {
    prepareRPC,
    createPost,
    getPosts,
    getPostById
}