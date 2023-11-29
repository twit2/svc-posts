import { APIRespConstructor, WithT2Session } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";
import { PostInsertOp } from "../op/PostInsertOp";
import { PostsMgr } from "../PostsMgr";

/**
 * Handles the post creation route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export async function handleCreatePost(req: Request, res: Response, next: NextFunction) {
    let userId = (req as Request & WithT2Session).session.id;

    if(!userId)
        throw new Error("Invalid user.");

    res.contentType('json');

    const postObj : PostInsertOp = {
        textContent: req.body.textContent,
        authorId: userId,
        replyToId: req.body.replyToId // In case we are dealing with a comment
    }

    // Verify schema
    const post = await PostsMgr.createPost(postObj);
    res.send(APIRespConstructor.success(post));
}