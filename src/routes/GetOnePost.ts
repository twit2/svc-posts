import { APIRespConstructor } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";
import { PostsMgr } from "../PostsMgr";

/**
 * Handles the post retrieval route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export async function handleGetOnePost(req: Request, res: Response, next: NextFunction) {
    let targetId = req.params.id;

    if(!targetId)
        throw new Error("Invalid post ID.");

    res.contentType('json');
    const posts = await PostsMgr.getEnhancedPost(targetId);
    res.send(APIRespConstructor.success(posts));
}