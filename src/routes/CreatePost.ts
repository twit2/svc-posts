import { APIRespConstructor, APIResponseCodes, Limits, WithT2Session } from "@twit2/std-library";
import { NextFunction, Request, Response } from "express";
import { PostInsertOp } from "../op/PostInsertOp";
import { PostsMgr } from "../PostsMgr";
import Ajv from "ajv";

const ajv = new Ajv();

const createPostSchema = {
    type: "object",
    properties: {
        textContent: { type: "string", minLength: Limits.posts.tcontent.min, maxLength: Limits.posts.tcontent.max },
        replyToId: { type: ["string"] },
        authorId: { type: ["string"] }
    },
    required: ["textContent"],
    additionalProperties: false
}


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
    if(!ajv.validate(createPostSchema, postObj)) {
        res.statusCode = 400;
        return res.end(JSON.stringify(APIRespConstructor.fromCode(APIResponseCodes.INVALID_REQUEST_BODY)));
    }

    const post = await PostsMgr.createPost(postObj);
    res.send(APIRespConstructor.success(post));
}