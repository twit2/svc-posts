import { APIRespConstructor, APIResponseCodes, Limits, WithT2Session } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";
import { PostInsertOp } from "../op/PostInsertOp";
import { PostsMgr } from "../PostsMgr";
import Ajv from "ajv";
import { PostRetrieveOp } from "../op/PostRetrieveOp";

const ajv = new Ajv();

const createPostSchema = {
    type: "object",
    properties: {
        page: { type: "number" },
        userId: { type: "string", minLength: Limits.general.hard.min, maxLength:Limits.general.hard.max }
    },
    required: ["page", "userId"],
    additionalProperties: false
}


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

    // Verify schema
    if(!ajv.validate(createPostSchema, retrieveOp)) {
        res.statusCode = 400;
        return res.end(JSON.stringify(APIRespConstructor.fromCode(APIResponseCodes.INVALID_REQUEST_BODY)));
    }

    const posts = await PostsMgr.getPosts(retrieveOp);
    res.send(APIRespConstructor.success(posts));
}