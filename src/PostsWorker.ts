import { RabbitMQQueueProvider } from "@twit2/std-library/dist/comm/providers/RabbitMqProvider"
import { MsgQueue, SessionVerifierMiddleware } from "@twit2/std-library";
import { FeedAlgorithm } from "./feed/FeedAlgorithm";

/**
 * Initializes the worker.
 * @param url MQ url.
 */
async function init(url: string) {
    let mq = new RabbitMQQueueProvider();
    await mq.setup(url);

    // Setup RPC server
    const server = new MsgQueue.rpc.RPCServer(mq);
    await server.init('t2-posts-service');

    // Setup rpc client
    const rpcc = new MsgQueue.rpc.RPCClient(mq);
    await rpcc.init('t2-auth-service');
    await SessionVerifierMiddleware.init(rpcc);

    // Setup user rpc client
    const rpcc2 = new MsgQueue.rpc.RPCClient(mq);
    await rpcc2.init('t2-user-service');
    FeedAlgorithm.init(rpcc2);
}

export const PostsWorker = {
    init
}