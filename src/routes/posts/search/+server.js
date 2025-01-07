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

    // Use LIKE for case-insensitive search with wildcards
    const posts = await platform.env.DB.prepare(
      `
        SELECT *
        FROM reddit_posts
        WHERE title LIKE ?
        ORDER BY score DESC
        LIMIT ?
      `
    )
      .bind(`%${keyword}%`, limit)
      .all();

    return new Response(JSON.stringify(posts.results), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
