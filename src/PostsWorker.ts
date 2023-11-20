import { RabbitMQQueueProvider } from "@twit2/std-library/dist/comm/providers/RabbitMqProvider"
import { MsgQueue, SessionVerifierMiddleware } from "@twit2/std-library";
import { prepareRPC } from "./PostsMgr";

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
    await rpcc.init('t2a-session-verif');
    await SessionVerifierMiddleware.init(rpcc);
}

export const PostsWorker = {
    init
}