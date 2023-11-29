import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PostModel } from "./models/PostModel";
import { PostsMgr } from "./PostsMgr";
import { Limits } from "@twit2/std-library";

describe('post manager tests', () => {
    let mongoServer: MongoMemoryServer;

    beforeAll(async()=> {
        // Setup server
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri(), { dbName: "t2-auth-test" });

        // Init models
        await PostModel.init();
    });

    // Creates a post
    test('create valid post', async() => {
        const post = await PostsMgr.createPost({
            textContent: 'Hello, world!',
            authorId: '__test__'
        });

        expect(post.textContent).toBe('Hello, world!');
        expect(post.authorId).toBe('__test__');
        expect(post.datePosted).not.toBeUndefined();
        expect(post.replyToId).toBeUndefined();
        expect(post.dateEdited).toBeUndefined();
    });

    // Reject empty post
    test('must reject empty post', async() => {
        try {
            await PostsMgr.createPost({
                textContent: '',
                authorId: '__test__'
            });
    
            fail('post was made.');
        } catch(e) {
            // Success
        }
    });

    // Reject post over max char limit
    test('must reject post over max char limit', async() => {
        try {
            await PostsMgr.createPost({
                textContent: 'a'.repeat(Limits.posts.tcontent.max + 1),
                authorId: '__test__'
            });
    
            fail('post was made.');
        } catch(e) {
            // Success
        }
    });

    // Reject post without author id
    test('must reject post with no author id', async() => {
        try {
            await PostsMgr.createPost({
                textContent: 'hello world',
                authorId: null as any
            });
    
            fail('post was made.');
        } catch(e) {
            // Success
        }
    });

    // Delete post
    test('must delete post', async() => {
        const post = await PostsMgr.createPost({
            textContent: 'hello world',
            authorId: '__test__'
        });

        await PostsMgr.deletePost({
            id: post.id,
            authorId: '__test__'
        });

        expect(await PostsMgr.getPostById(post.id)).toBeNull();
    });

    // Reject deletion if user does not own post.
    test('must reject deletion if user does not own post.', async() => {
        try {
            const post = await PostsMgr.createPost({
                textContent: 'hello world',
                authorId: '__testa__'
            });

            await PostsMgr.deletePost({
                id: post.id,
                authorId: '__test__'
            });

            fail('Post was deleted.');
        } catch(e) {

        }
    });

    // Reject non existent post
    test('must reject deletion of non existent post.', async() => {
        try {
            await PostsMgr.deletePost({
                id: '12345',
                authorId: '__test__'
            });
            fail('Somehow, no exception was fired.');
        } catch(e) {

        }
    });

    afterAll(async() => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });
});
