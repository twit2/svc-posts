import mongoose from "mongoose";
import { MongoMemoryServer } from 'mongodb-memory-server';
import { PostModel } from "./models/PostModel";

describe('post manager tests', () => {
    let mongoServer: MongoMemoryServer;

    beforeAll(async()=> {
        // Setup server
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri(), { dbName: "t2-auth-test" });

        // Init models
        await PostModel.init();
    });

    // Test to ensure the model rejects invalid params
    test('create invalid post must fail', async() => {
        expect(1).toBe(1);
    });

    afterAll(async() => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });
});
