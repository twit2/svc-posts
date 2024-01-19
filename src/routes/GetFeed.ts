import { APIRespConstructor, WithT2Session } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";
import { PostsMgr } from "../PostsMgr";
import { PostRetrieveOp } from "../op/PostRetrieveOp";

/**
 * Handles the get personalized feed route.
 * @param req The request object.
 * @param res The response object.
 * @param next Next function.
 */
export async function handleGetFeed(req: Request, res: Response, next: NextFunction) {
    let uid = (req as Request & WithT2Session).session.id;

    const retrieveOp : PostRetrieveOp = {
        userId: uid,
        page: parseInt((req.params as any).page)
    };

    res.send(APIRespConstructor.success(await PostsMgr.getFeed(retrieveOp)));
}