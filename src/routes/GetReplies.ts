import { APIError, APIRespConstructor, APIResponseCodes, WithT2Session } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";
import { PostsMgr } from "../PostsMgr";
import { ReplyRetrieveOp } from "../op/ReplyRetrieveOp";

/**
 * Handles the replies retrieval route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export async function handleGetReplies(req: Request, res: Response, next: NextFunction) {
    const userId = (req as Request & WithT2Session).session.id;
    const postId = req.params.id;
    const pageNum = req.params.page;

    if((!userId) || (!postId))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    res.contentType('json');

    const retrieveOp : ReplyRetrieveOp = {
        postId,
        page: parseInt(pageNum)
    };

    const posts = await PostsMgr.getReplies(retrieveOp);
    res.send(APIRespConstructor.success(posts));
}