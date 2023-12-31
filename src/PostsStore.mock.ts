import { Post } from "./types/Post";

function _mock_paginate<T>(arr: any[], start: number, limit: number): T[] {
    const items : T[] = [];
    let max = start + limit;
    
    if(max > arr.length)
        max = arr.length;

    for(let x = start; x < max; x++)
        items.push(arr[x]);

    return items;
}

function _dateComparer(a: Post, b: Post): number {
    if(a.datePosted > b.datePosted) return 1;
    else if(a.datePosted < b.datePosted) return -1;
    return 0;
}

/**
 * Initializes the post store.
 */
async function init() {
    // mock ignore
}

const posts : Post[] = [];

/**
 * Creates a post.
 * @param post The post to push.
 */
async function createPost(post: Post) : Promise<Post> {
    const i = posts.push(post);
    return posts[i - 1];
}

/**
 * Deletes a post.
 * @param id The id of the post to delete.
 */
async function deletePost(id: string) {
    const postIdx = posts.findIndex(x => x.id == id);
    
    if(postIdx >= 0)
        posts.splice(postIdx, 1);
}

/**
 * Finds a post by ID.
 * @param id The id to use.
 */
async function findPostById(id: string): Promise<Post | null> {
    return posts.find(x => x.id == id) ?? null;
}

/**
 * Gets posts.
 */
async function getPosts(page: number, limit: number, userId: string): Promise<Post[]> { 
    const arr : Post[] = [];

    for(let post of posts) {
        if((post.authorId === userId) && (post.replyToId === undefined))
            arr.push(post);
    }

    return _mock_paginate(arr.sort(_dateComparer), page * limit, limit);
}

/**
 * Get latest posts.
 */
async function getLatestPosts(page: number, limit: number): Promise<Post[]> {
    const arr : Post[] = [];

    for(let post of posts) {
        if((post.replyToId === undefined))
            arr.push(post);
    }

    return _mock_paginate(arr.sort(_dateComparer), page * limit, limit);
}

/**
 * Gets comments.
 */
async function getReplies(page: number, limit: number, postId: string): Promise<Post[]> {
    const arr : Post[] = [];

    for(let post of posts) {
        if((post.replyToId === postId))
            arr.push(post);
    }

    return _mock_paginate(arr.sort(_dateComparer), page * limit, limit);
}

/**
 * Gets the reply count for the specified post.
 * @param postId The ID of the post to get the count for.
 */
async function getReplyCount(postId: string): Promise<number> {
    let c = 0;
    
    for(let p of posts)
        if(p.replyToId == postId)
            c++;

    return c;
}

/**
 * Edits the text content of the post.
 * @param id The ID of the post to edit
 * @param textContent The new content to place.
 */
async function editPost(id: string, textContent: string): Promise<Post> {
    const post = await findPostById(id);
    
    if(!post)
        throw new Error("Post does not exist.");

    post.textContent = textContent;
    post.dateEdited = new Date();
    
    return post;
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