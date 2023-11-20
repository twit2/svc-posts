import mongoose, { Schema } from 'mongoose'
import { Limits } from '@twit2/std-library';
import { Post } from '../types/Post';

export const PostModel = mongoose.model<Post>('post', new mongoose.Schema({
    id: {
        type: String,
        required: true,
        min: Limits.general.id.min,
        max: Limits.general.id.max
    },
    authorId: {
        type: String,
        required: true,
        min: Limits.general.id.min,
        max: Limits.general.id.max
    },
    replyToId: {
        type: String,
        required: false,
        min: Limits.general.id.min,
        max: Limits.general.id.max
    },
    textContent: {
        type: String,
        required: true,
        min: Limits.posts.tcontent.min,
        max: Limits.posts.tcontent.max
    },
    datePosted: {
        type: Date,
        required: true
    },
    dateEdited: {
        type: Date,
        required: false
    }
}));