import { APIRespConstructor, GenericPagedOp } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";
import { PostsMgr } from "../PostsMgr";

/**
 * Handles the latest posts retrieval route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export async function handleGetLatestPosts(req: Request, res: Response, next: NextFunction) {
    res.contentType('json');

    const pageOp : GenericPagedOp = {
        page: parseInt((req.params as any).page)
    };

    const posts = await PostsMgr.getLatestPosts(pageOp);
    res.send(APIRespConstructor.success(posts));
}