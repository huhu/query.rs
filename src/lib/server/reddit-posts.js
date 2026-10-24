import { error } from "@sveltejs/kit";
import { isPostId } from "$lib/reddit-post.js";

const SELECT = `SELECT postId, score, title, selftext, author, permalink, url, createdAt, numComments
         FROM reddit_posts
         WHERE postId = ?`;

const BY_DATE_SQL = `SELECT *
        FROM reddit_posts
        WHERE date(createdAt) >= date(?)
        AND date(createdAt) <= date(?)
        ORDER BY score DESC
        LIMIT ?`;

const SEARCH_SQL = `SELECT *
        FROM reddit_posts
        WHERE title LIKE ?
        ORDER BY score DESC
        LIMIT ?`;

/**
 * Same query as GET /posts?start&end.
 * @param {{ prepare: Function }} db
 * @param {string} start
 * @param {string} end
 * @param {number} limit
 */
export async function listRedditPostsByDate(db, start, end, limit) {
  const posts = await db.prepare(BY_DATE_SQL).bind(start, end, limit).all();
  return posts?.results ?? [];
}

/**
 * Same query as GET /posts/search?q=.
 * @param {{ prepare: Function }} db
 * @param {string} keyword
 * @param {number} limit
 */
export async function searchRedditPosts(db, keyword, limit) {
  const posts = await db.prepare(SEARCH_SQL).bind(`%${keyword}%`, limit).all();
  return posts?.results ?? [];
}

/**
 * @param {App.Platform | undefined} platform
 * @param {string | undefined} id
 */
export async function fetchRedditPost(platform, id) {
  const postId = (id || "").toLowerCase();
  if (!isPostId(postId)) error(404, "Post not found");

  const db = platform?.env?.DB;
  if (!db) error(500, "Database unavailable");

  /** @type {RedditPostRow | null} */
  let row;
  try {
    row = await db.prepare(SELECT).bind(postId).first();
  } catch (err) {
    console.error("post query failed", err);
    error(500, "Could not load post");
  }

  if (!row) error(404, "Post not found");
  return row;
}

/**
 * @typedef {Object} RedditPostRow
 * @property {string} postId
 * @property {number | null} score
 * @property {string | null} title
 * @property {string | null} selftext
 * @property {string | null} author
 * @property {string | null} permalink
 * @property {string | null} url
 * @property {string | null} createdAt
 * @property {number | null} numComments
 */
