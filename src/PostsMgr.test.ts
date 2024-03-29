import { PostsMgr } from "./PostsMgr";
import { Limits, TestingUtils } from "@twit2/std-library";
import { Post } from "./types/Post";

describe('post manager tests', () => {
    let testPostId: string = "";
    const TEST_POST_COUNT = 10;
    const MOCK_USER1 = "__test1__";
    const MOCK_USER2 = "__test2__";

    // Creates a post
    test('create valid post', async() => {
        const post = await PostsMgr.createPost({
            textContent: 'Hello, world!',
            authorId: MOCK_USER1
        });

        expect(post.id).not.toBeUndefined();
        expect(post.textContent).toBe('Hello, world!');
        expect(post.authorId).toBe(MOCK_USER1);
        expect(post.datePosted).not.toBeUndefined();
        expect(post.replyToId).toBeUndefined();
        expect(post.dateEdited).toBeUndefined();

        testPostId = post.id;
    });

    // Gets a valid post
    test('get valid post', async ()=> {
        const post = await PostsMgr.getPostById(testPostId) as Post;

        expect(post).not.toBeUndefined();
        expect(post.id).not.toBeUndefined();
        expect(post.textContent).toBe('Hello, world!');
        expect(post.authorId).toBe(MOCK_USER1);
        expect(post.datePosted).not.toBeUndefined();
        expect(post.replyToId).toBeUndefined();
        expect(post.dateEdited).toBeUndefined();
    });

    // Creates a post
    test('create valid posts', async() => {
        for(let x = 0; x < TEST_POST_COUNT; x++) {
            await PostsMgr.createPost({
                textContent: `Hello world ${x}`,
                authorId: MOCK_USER1
            });
        }
    });

    // Gets valid posts
    test('get posts must fail without valid dto', async ()=> {
        await TestingUtils.mustFailAsync(async()=>{await PostsMgr.getPosts({} as any)}, "posts were retrieved");
    });

    test('get valid posts', async ()=> {
        const posts = await PostsMgr.getPosts({ page: 0, userId: MOCK_USER1 });

        expect(posts.data).not.toBeUndefined();
        expect(posts.data?.length).toBe(TEST_POST_COUNT);
    });

    // Gets latest posts
    test('get latest posts', async ()=> {
        const posts = await PostsMgr.getLatestPosts({ page: 0 });

        expect(posts.data).not.toBeUndefined();
        expect(posts.data?.length).toBe(TEST_POST_COUNT);
    });

    test('get latest posts must fail without valid dto', async ()=> {
        await TestingUtils.mustFailAsync(async()=>{await PostsMgr.getLatestPosts({} as any)}, "latest posts were retrieved");
    });

    // Reject empty post
    test('must reject empty post', async() => {
        try {
            await PostsMgr.createPost({
                textContent: '',
                authorId: MOCK_USER1
            });
        } catch(e) {
            return;
        }

        throw new Error('Post was made');
    });

    // Reject post over max char limit
    test('must reject post over max char limit', async() => {
        try {
            await PostsMgr.createPost({
                textContent: 'a'.repeat(Limits.posts.tcontent.max + 1),
                authorId: MOCK_USER1
            });
        } catch(e) {
            return;
        }

        throw new Error('Post was made');
    });

    // Reject post without author id
    test('must reject post with no author id', async() => {
        try {
            await PostsMgr.createPost({
                textContent: 'hello world',
                authorId: null as any
            });
        } catch(e) {
            return;
        }

        throw new Error('Post was made');
    });

    // Delete post
    test('must delete post', async() => {
        const post = await PostsMgr.createPost({
            textContent: 'hello world',
            authorId: MOCK_USER1
        });

        await PostsMgr.deletePost({
            id: post.id,
            authorId: MOCK_USER1
        });

        expect(await PostsMgr.getPostById(post.id)).toBeNull();
    });

    // Reject deletion if user does not own post.
    test('must reject deletion if user does not own post.', async() => {
        try {
            const post = await PostsMgr.createPost({
                textContent: 'hello world',
                authorId: MOCK_USER2
            });

            await PostsMgr.deletePost({
                id: post.id,
                authorId: MOCK_USER1
            });
        } catch(e) {
            return;
        }

        throw new Error('Post was deleted.');
    });

    // Reject non existent post
    test('must reject deletion of non existent post.', async() => {
        try {
            await PostsMgr.deletePost({
                id: '12345',
                authorId: MOCK_USER1
            });
        } catch(e) {
            return
        }

        throw new Error("Non existent post was deleted.");
    });

    // Edit post
    test('must be able to edit post', async() => {
        const post = await PostsMgr.createPost({
            textContent: 'hello world',
            authorId: MOCK_USER1
        });

        const updatedPost = await PostsMgr.editPost({
            authorId: MOCK_USER1,
            id: post.id,
            textContent: "Updated Text"
        });

        expect(updatedPost.dateEdited).not.toBeUndefined();
        expect(updatedPost.textContent).toBe("Updated Text");
    });

    test('post edit must reject if post does not exist', async()=>{
        await TestingUtils.mustFailAsync(async()=>{await PostsMgr.editPost({ authorId: MOCK_USER1, id: "abc", textContent: "Updated Text" });}, "post was edited");
    });

    // Reject empty edit
    test('must reject empty edit', async() => {
        try {
            const post = await PostsMgr.createPost({
                textContent: 'hello world',
                authorId: MOCK_USER1
            });
    
            await PostsMgr.editPost({
                authorId: MOCK_USER1,
                id: post.id,
                textContent: ""
            });
        } catch(e) {
            return;
        }

        throw new Error('The edit succeeded :(');
    });

    // Reject edit if acting user is not the owner
    test('must reject edit if acting user is not the owner', async() => {
        try {
            const post = await PostsMgr.createPost({
                textContent: 'hello world',
                authorId: MOCK_USER1
            });
    
            await PostsMgr.editPost({
                authorId: MOCK_USER2,
                id: post.id,
                textContent: ""
            });
        } catch(e) {
            return;
        }

        throw new Error('The edit succeeded :(');
    });

    // Reject overflown edit
    test('must reject overflown edit', async() => {
        try {
            const post = await PostsMgr.createPost({
                textContent: 'hello world',
                authorId: MOCK_USER1
            });
    
            await PostsMgr.editPost({
                authorId: MOCK_USER1,
                id: post.id,
                textContent: "yes".repeat(Limits.posts.tcontent.max)
            });
        } catch(e) {
            return;
        }

        throw new Error('The edit succeeded :(');
    });

    // Post reply to post
    test('post reply to post successfully', async() => {
        const post = await PostsMgr.createPost({
            textContent: 'this post will have replies',
            authorId: MOCK_USER1
        });

        const reply = await PostsMgr.createPost({
            textContent: 'reply',
            authorId: MOCK_USER2,
            replyToId: post.id
        })
    
        expect(reply.replyToId).toBe(post.id);
    });

    // Post reply must fail if post doesnt exist
    test('post reply must fail if target post does not exist', async() => {
        await TestingUtils.mustFailAsync(async()=>{
            await PostsMgr.createPost({
                textContent: 'reply',
                authorId: MOCK_USER2,
                replyToId: "abc"
            })
        }, "reply was made");
    });

    // Get replies
    test('get post replies', async() => {
        const post = await PostsMgr.createPost({
            textContent: 'this post will have replies 2',
            authorId: MOCK_USER1
        });

        for(let x = 0; x < TEST_POST_COUNT; x++) {
            await PostsMgr.createPost({
                textContent: `This is reply #${x}`,
                authorId: MOCK_USER2,
                replyToId: post.id
            });
        }

        // Get replies
        let replies = await PostsMgr.getReplies({ page: 0, postId: post.id });
        expect(replies.data).not.toBeUndefined();
        expect(replies.data?.length).toBe(TEST_POST_COUNT);

        for(let reply of replies.data ?? [])
            expect(reply.replyToId).toBe(post.id);
    });

    // Get enhanced post must reject invalid post
    test('get enhanced post: must return post that exists', async() => {
        const post = await PostsMgr.createPost({
            textContent: 'test post',
            authorId: MOCK_USER2
        });

        const enhancedPost = await PostsMgr.getEnhancedPost(post.id);
        expect(enhancedPost).not.toBeUndefined();
    });

    test('get enhanced post: must error on null post', async() => {
        await TestingUtils.mustFailAsync(async()=>{ await PostsMgr.getEnhancedPost(null as any)}, "no error was thrown");
    });
});
