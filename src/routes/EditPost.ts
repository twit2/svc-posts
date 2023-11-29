import { APIError, APIRespConstructor, APIResponseCodes, WithT2Session } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";
import { PostsMgr } from "../PostsMgr";
import { PostEditOp } from "../op/PostUpdateOp";

/**
 * Handles the post edit route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export async function handlePostEdit(req: Request, res: Response, next: NextFunction) {
    const userId = (req as Request & WithT2Session).session.id;
    const postId = req.params.id;

    if((!userId) || (!postId))
        throw APIError.fromCode(APIResponseCodes.INVALID_REQUEST_BODY);

    res.contentType('json');

    const op : PostEditOp = {
        textContent: req.body.textContent,
        authorId: userId,
        id: postId
    };

    // Verify schema
    const post = await PostsMgr.editPost(op);
    res.send(APIRespConstructor.success(post));
}