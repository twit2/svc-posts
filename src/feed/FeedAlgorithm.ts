import { PaginatedAPIData } from "@twit2/std-library";
import { RPCClient } from "@twit2/std-library/dist/comm/rpc/RPCClient";
import { Post } from "../types/Post";
import { PostsMgr } from "../PostsMgr";

let rpcc : RPCClient;
const PAGE_SIZE = 10;
const USVC_PAGE_SIZE = 10;

/**
 * Computes a new feed page.
 * @param sourceUser The source user to get the page for.
 * @param page The page number.
 */
export async function computePage(sourceUser: string, page: number): Promise<PaginatedAPIData<Post>> {
    const posts : Post[] = [];
    

    return {
        currentPage: page,
        pageSize: PAGE_SIZE,
        data: posts
    }
}

/**
 * Initializes the feed algorithm.
 */
export function init(client: RPCClient) {
    rpcc = client;
}

export const FeedAlgorithm = {
    init,
    computePage
}