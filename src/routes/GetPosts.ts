import { APIRespConstructor, WithT2Session } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";
import { PostsMgr } from "../PostsMgr";
import { PostRetrieveOp } from "../op/PostRetrieveOp";

/**
 * Handles the post retrieval route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export async function handleGetPosts(req: Request, res: Response, next: NextFunction) {
    let targetId: string;

    if(req.params.id == "@me")
        targetId = (req as Request & WithT2Session).session.id;
    else
        targetId = req.params.user;

    if(!targetId)
        throw new Error("Invalid user.");

    res.contentType('json');

    const retrieveOp : PostRetrieveOp = {
        userId: targetId,
        page: parseInt((req.params as any).page)
    };

    const posts = await PostsMgr.getPosts(retrieveOp);
    res.send(APIRespConstructor.success(posts));
}