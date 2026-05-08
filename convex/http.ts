import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

// CORS preflight
http.route({
  path: "/articles",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { headers: CORS })),
});

// GET /articles — list all articles
http.route({
  path: "/articles",
  method: "GET",
  handler: httpAction(async (ctx) => {
    const articles = await ctx.runQuery(api.articles.list);
    return json(articles);
  }),
});

// POST /articles — create an article
http.route({
  path: "/articles",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const data = await request.json();
    const id = await ctx.runMutation(api.articles.add, data);
    return json({ id });
  }),
});

// DELETE /articles?id=xxx — delete an article by Convex _id
http.route({
  path: "/articles",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return json({ error: "Missing id" }, 400);
    await ctx.runMutation(api.articles.remove, { id: id as any });
    return json({ ok: true });
  }),
});

export default http;
