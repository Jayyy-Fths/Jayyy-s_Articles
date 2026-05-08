import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("articles").collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});

export const add = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("articles", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("articles"),
    slug: v.optional(v.string()),
    title: v.optional(v.string()),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    author: v.optional(v.string()),
    authorBio: v.optional(v.string()),
    authorAvatar: v.optional(v.string()),
    date: v.optional(v.string()),
    readingTime: v.optional(v.string()),
    wordCount: v.optional(v.number()),
    image: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    externalUrl: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    relatedSlugs: v.optional(v.array(v.string())),
    content: v.optional(v.string()),
    series: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});

export const remove = mutation({
  args: { id: v.id("articles") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
