import { PaginatedAPIData } from "@twit2/std-library";
import { RPCClient } from "@twit2/std-library/dist/comm/rpc/RPCClient";
import { EnhancedPost } from "../types/Post";
import { PostsMgr } from "../PostsMgr";

let rpcc : RPCClient;
const PAGE_SIZE = 10;
const USVC_PAGE_SIZE = 10;

interface FollowStat {
    following: number;
}

interface RelevantRelation {
    dest: string;
}

async function calculateNextGroup(sourceUser: string, page: number): Promise<string[]> {
    const following = await rpcc.makeCall("get-following", sourceUser, page) as PaginatedAPIData<RelevantRelation>;

    if(!following.data)
        return [];

    return following.data.map((x: RelevantRelation) => x.dest);
}

/**
 * Computes a new feed page.
 * @param sourceUser The source user to get the page for.
 * @param page The page number.
 */
export async function computePage(sourceUser: string, page: number): Promise<PaginatedAPIData<EnhancedPost>> {
    // I did not have time to really work this out, making a social media algorithm is harder than it sounds
    const posts : EnhancedPost[] = [];
    const fstat = await rpcc.makeCall("get-following-stats", sourceUser) as FollowStat;

    //let groupIndex = 
    

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