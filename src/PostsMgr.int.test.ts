import './PostsMgr.test';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { PostModel } from './models/PostModel';

let mongoServer: MongoMemoryServer;

beforeAll(async()=> {
    // Setup server
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), { dbName: "t2-posts-test" });

    // Init models
    await PostModel.init();
});

afterAll(async() => {
    await mongoose.disconnect();
    await mongoServer.stop();
});