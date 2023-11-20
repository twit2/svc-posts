export interface Post {
    id: string;
    authorId: string;
    textContent: string;
    replyToId?: string;
    datePosted: Date;
    dateEdited?: Date;
}