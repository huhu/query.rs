import { error } from "@sveltejs/kit";
import {
  externalUrl,
  formatCreatedAt,
  formatTitle,
  isImageUrl,
  isMediaUrl,
  isPostId,
  isVideoUrl,
  metaDescription,
  postCanonical,
  publishedTime,
  redditUrl,
  renderMarkdown,
  SITE_ORIGIN,
} from "$lib/reddit-post.js";

export const prerender = false;
export const ssr = true;

/**
 * @param {App.Platform | undefined} platform
 */
function database(platform) {
  const db = platform?.env?.DB;
  if (!db) error(500, "Database unavailable");
  return db;
}

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, platform, setHeaders }) {
  const id = (params.id || "").toLowerCase();
  if (!isPostId(id)) error(404, "Post not found");

  const db = database(platform);

  /** @type {RedditPostRow | null} */
  let row;
  try {
    row = await db
      .prepare(
        `SELECT postId, score, title, selftext, author, permalink, url, createdAt, numComments
         FROM reddit_posts
         WHERE postId = ?`
      )
      .bind(id)
      .first();
  } catch (err) {
    console.error("post query failed", err);
    error(500, "Could not load post");
  }

  if (!row) error(404, "Post not found");

  setHeaders({
    "cache-control": "public, max-age=3600",
  });

  const title = formatTitle(row) || "Reddit post";
  const description = metaDescription(row);
  const canonical = postCanonical(row.postId);
  const image = isImageUrl(row.url) ? row.url : `${SITE_ORIGIN}/og.png`;
  const published = publishedTime(row.createdAt);

  return {
    post: {
      postId: row.postId,
      title,
      author: row.author || "",
      score: row.score ?? 0,
      createdAtLabel: formatCreatedAt(row.createdAt),
      publishedTime: published,
      numComments: row.numComments ?? null,
      redditUrl: redditUrl(row.permalink),
      externalUrl: externalUrl(row.url),
      mediaUrl: isMediaUrl(row.url) ? row.url : "",
      video: isVideoUrl(row.url),
      bodyHtml: renderMarkdown(row.selftext),
    },
    seo: {
      title: `${title} · Query.rs`,
      description,
      canonical,
      ogType: "article",
      image,
      publishedTime: published,
      author: row.author || "",
    },
  };
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
