import { renderSitemap, sitemapBudgets } from "$lib/sitemap.js";

export const prerender = false;

const PAGE_SIZE = 2000;

/**
 * @param {{ prepare: (sql: string) => { bind: (...values: unknown[]) => { first: () => Promise<{ total?: number } | null> } } }} db
 */
async function countPosts(db) {
  const row = await db.prepare(`SELECT COUNT(*) AS total FROM reddit_posts`).bind().first();
  return Number(row?.total) || 0;
}

/**
 * @param {{ prepare: (sql: string) => { bind: (...values: unknown[]) => { all: () => Promise<{ results?: { postId: string, title: string, createdAt: string }[] }> } } }} db
 * @param {number} maxUrls
 */
async function listPosts(db, maxUrls) {
  /** @type {{ postId: string, title: string, createdAt: string }[]} */
  const posts = [];
  let offset = 0;

  while (posts.length < maxUrls) {
    const batch = await db
      .prepare(
        `SELECT postId, title, createdAt
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

  return posts.slice(0, maxUrls);
}

export async function GET({ platform }) {
  /** @type {{ postId: string, title: string, createdAt: string }[]} */
  let posts = [];
  let totalPosts = 0;
  try {
    if (platform?.env?.DB) {
      totalPosts = await countPosts(platform.env.DB);
      posts = await listPosts(platform.env.DB, sitemapBudgets(totalPosts).postCount);
    }
  } catch (err) {
    console.error("sitemap query failed", err);
  }

  return new Response(renderSitemap(posts, { totalPosts }), {
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
