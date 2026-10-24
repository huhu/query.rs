import { MAX_POST_URLS, renderSitemap } from "$lib/sitemap.js";

export const prerender = false;

const PAGE_SIZE = 2000;
const MAX_URLS = MAX_POST_URLS;

/**
 * @param {{ prepare: (sql: string) => { bind: (...values: unknown[]) => { all: () => Promise<{ results?: { postId: string, createdAt: string }[] }> } } }} db
 */
async function listPosts(db) {
  /** @type {{ postId: string, createdAt: string }[]} */
  const posts = [];
  let offset = 0;

  while (posts.length < MAX_URLS) {
    const batch = await db
      .prepare(
        `SELECT postId, createdAt
         FROM reddit_posts
         ORDER BY createdAt DESC
         LIMIT ? OFFSET ?`
      )
      .bind(PAGE_SIZE, offset)
      .all();
    const rows = batch?.results ?? [];
    posts.push(...rows);
    if (rows.length < PAGE_SIZE) break;
    offset += rows.length;
  }

  return posts.slice(0, MAX_URLS);
}

export async function GET({ platform }) {
  /** @type {{ postId: string, createdAt: string }[]} */
  let posts = [];
  try {
    if (platform?.env?.DB) {
      posts = await listPosts(platform.env.DB);
    }
  } catch (err) {
    console.error("sitemap query failed", err);
  }

  return new Response(renderSitemap(posts), {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
