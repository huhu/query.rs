import { searchRedditPosts } from "$lib/server/reddit-posts.js";

export async function GET({ url, platform }) {
  try {
    const keyword = url.searchParams.get("q");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    if (!keyword) {
      return new Response(
        JSON.stringify({ error: "Search keyword is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const posts = await searchRedditPosts(platform.env.DB, keyword, limit);

    return new Response(JSON.stringify(posts), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
