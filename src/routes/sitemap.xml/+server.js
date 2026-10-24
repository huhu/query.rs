import { DISCUSSION_BODY_SQL } from "$lib/reddit-post.js";
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
         WHERE ${DISCUSSION_BODY_SQL}
         ORDER BY createdAt DESC, postId DESC
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

/**
 * A failed read must not be stored as a public sitemap. Crawlers then keep the last good copy.
 */
function sitemapUnavailable() {
  return new Response("Sitemap unavailable", {
    status: 500,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export async function GET({ platform }) {
  const db = platform?.env?.DB;
  if (!db) return sitemapUnavailable();

  try {
    const totalPosts = await countPosts(db);
    const posts = await listPosts(db, sitemapBudgets(totalPosts).postCount);
    return new Response(renderSitemap(posts, { totalPosts }), {
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("sitemap query failed", err);
    return sitemapUnavailable();
  }
}
