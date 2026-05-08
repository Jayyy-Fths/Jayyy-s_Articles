import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  articles: defineTable({
    slug: v.string(),
    title: v.string(),
    category: v.string(),
    tags: v.array(v.string()),
    author: v.string(),
    authorBio: v.optional(v.string()),
    authorAvatar: v.optional(v.string()),
    date: v.string(),
    readingTime: v.optional(v.string()),
    wordCount: v.optional(v.number()),
    image: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    externalUrl: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    relatedSlugs: v.optional(v.array(v.string())),
    content: v.optional(v.string()),
    series: v.optional(v.string()),
  }).index("by_slug", ["slug"]),
});
