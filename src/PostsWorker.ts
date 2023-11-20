import { RabbitMQQueueProvider } from "@twit2/std-library/dist/comm/providers/RabbitMqProvider"
import { MsgQueue } from "@twit2/std-library";

/**
 * Initializes the worker.
 * @param url MQ url.
 */
async function init(url: string) {
    let mq = new RabbitMQQueueProvider();
    await mq.setup(url);

    // Setup RPC server
    const server = new MsgQueue.rpc.RPCServer(mq);
    await server.init('t2-posts');
}

export const PostsWorker = {
    init
}