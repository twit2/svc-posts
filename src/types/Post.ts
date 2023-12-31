import { WithPostStatistics } from "./WithPostStatistics";

export interface Post {
    id: string;
    authorId: string;
    textContent: string;
    replyToId?: string;
    datePosted: Date;
    dateEdited?: Date;
};

export type EnhancedPost = Post & WithPostStatistics;