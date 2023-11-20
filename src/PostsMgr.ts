import { Limits, generateId } from "@twit2/std-library";
import { PostsStore } from "./PostsStore";
import { PostInsertOp } from "./op/PostInsertOp";
import { Post } from "./types/Post";
import { RPCClient } from "@twit2/std-library/dist/comm/rpc/RPCClient";
import { PostRetrieveOp } from "./op/PostRetrieveOp";

let authRPC : RPCClient;

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
    if(op.textContent.length > Limits.posts.tcontent.max)
        throw new Error("Post too long."); // Provide friendly error - yes we also check this in DB

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
async function getPosts(op: PostRetrieveOp) {
    return await PostsStore.getPosts(op.page, 10, op.userId);
}

export const PostsMgr = {
    prepareRPC,
    createPost,
    getPosts
}