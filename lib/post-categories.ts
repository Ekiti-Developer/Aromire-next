export const POST_CATEGORIES = ["News", "Programs", "Stories", "Announcements"] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];
