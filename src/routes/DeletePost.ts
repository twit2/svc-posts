import { APIError, APIRespConstructor, APIResponseCodes, Limits, WithT2Session } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";
import { PostInsertOp } from "../op/PostInsertOp";
import { PostsMgr } from "../PostsMgr";

/**
 * Handles the post creation route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export async function handleDeletePost(req: Request, res: Response, next: NextFunction) {
    const userId = (req as Request & WithT2Session).session.id;
    const postId = req.params.id;

    if((!userId) || (!postId))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    res.contentType('json');

    await PostsMgr.deletePost({
        id: postId,
        authorId: userId
    });
    
    res.send(APIRespConstructor.success());
}