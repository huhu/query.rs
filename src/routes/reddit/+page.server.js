import { presentRedditPost } from "$lib/reddit-post.js";
import { listRedditPostsByDate, searchRedditPosts } from "$lib/server/reddit-posts.js";

export const prerender = false;
export const ssr = true;

const PAGE_SIZE = 20;

/**
 * UTC day, matching the reader's client fetch (`toISOString().slice(0, 10)`).
 * @param {Date} [now]
 */
function utcToday(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

/**
 * @param {string} message
 * @param {{ mode?: string, query?: string, date?: string }} [extra]
 */
function empty(message, extra = {}) {
  return {
    mode: extra.mode || "date",
    query: extra.query || "",
    date: extra.date || utcToday(),
    posts: [],
    selectedPost: null,
    headerTitle: "",
    error: message,
  };
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, platform, setHeaders }) {
  const query = (url.searchParams.get("q") || "").trim();
  const date = utcToday();
  const db = platform?.env?.DB;

  if (!db) {
    setHeaders({ "cache-control": "no-store" });
    return empty("Database unavailable", { mode: query ? "search" : "date", query, date });
  }

  try {
    const rows = query
      ? await searchRedditPosts(db, query, PAGE_SIZE)
      : await listRedditPostsByDate(db, date, date, PAGE_SIZE);
    const posts = rows.map((row) => presentRedditPost(row));
    setHeaders({ "cache-control": "public, max-age=3600" });
    return {
      mode: query ? "search" : "date",
      query,
      date,
      posts,
      selectedPost: posts[0] ?? null,
      headerTitle: query ? `Search Results: "${query}" (${posts.length} results)` : "",
      error: null,
    };
  } catch (err) {
    console.error("reddit reader query failed", err);
    setHeaders({ "cache-control": "no-store" });
    return empty("Could not load posts", { mode: query ? "search" : "date", query, date });
  }
}
